import { Context, Router } from "@oak/oak";
import * as logger from "@std/log";
import { AccountDao } from "../dao/account-dao.ts";
import { Account, AccountDTO, ConfirmAccountDTO } from "../model/account.ts";
import PasswordService from "../infrastructure/password-service.ts";
import { json, success } from "../util/api-response.ts";
import { Authenticator } from "../infrastructure/authenticator.ts";
import sendMail from "../util/mailer.ts";
import Controller from "./controller.ts";
import { Environment } from "../infrastructure/environment.ts";
import { ErrorReporter } from "../infrastructure/error-reporter.ts";

interface AccountControllerOptions {
  router: Router;
  accountDao: AccountDao;
  errorReporter: ErrorReporter;
  authenticator: Authenticator;
}

export class AccountController extends Controller {
  private securePwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})/gm;
  private accountDao: AccountDao;
  private errorReporter: ErrorReporter;
  private authenticator: Authenticator;

  constructor(
    { router, accountDao, errorReporter, authenticator }: AccountControllerOptions,
  ) {
    super(router);
    this.accountDao = accountDao;
    this.errorReporter = errorReporter;
    this.authenticator = authenticator;

    this.handleRequests();
  }

  get default() {
    return "/account";
  }

  get confirm() {
    return "/account/confirm";
  }

  get recover() {
    return "/account/recover";
  }

  get changePassword() {
    return "/account/resetpassword";
  }

  get delete() {
    return "/account/delete";
  }

  get lastUser() {
    return "/account/lastuser";
  }

  handleRequests(): void {
    this.router
      .post(this.default, (ctx: Context) => this.postAccount(ctx))
      .get(this.default, (ctx: Context) => this.getAccount(ctx))
      .post(
        this.delete,
        (ctx: Context) => this.deleteAccount(ctx),
      );

    this.router
      .post(this.confirm, (ctx: Context) => this.confirmAccount(ctx))
      .post(this.recover, (ctx: Context) => this.recoverAccount(ctx))
      .post(this.changePassword, (ctx: Context) => this.resetPassword(ctx))
      .post(this.lastUser, (ctx: Context) => this.updateLastUser(ctx));
  }

  async postAccount(ctx: Context): Promise<void> {
    const accountDto = await ctx.request.body.json() as AccountDTO;
    const email = accountDto.email.trim();
    const password = accountDto.password;
    const securePassword = password.match(this.securePwdRegex);
    const isSecure = securePassword?.length;

    if (!isSecure) {
      return json(ctx, { message: this.$t.weakPassword }, 400);
    }

    const hash = PasswordService.encrypt(password);

    try {
      if (!await this.isAccountUnique(email)) {
        return json(ctx, { message: this.$t.accountAlreadyExists }, 400);
      }

      const account = {
        email,
        password: hash,
        registrationCode: Account.generateRegistrationCode(),
        resetToken: null,
      };

      await this.accountDao.insert([account]);

      const subject = this.$t.emailSubject;
      const content = this.$t.emailContent + account.registrationCode;

      const isDev = Environment.isDevelopmentMode();

      if (!isDev) {
        await sendMail(account.email, subject, content, this.errorReporter);
      } else {
        logger.info(
          `Created account in dev mode, registration code: ${account.registrationCode}`,
        );
      }
      success(ctx);
    } catch (error) {
      this.errorReporter.captureException(error as Error);

      try {
        // Mail sending has probably gone wrong. Remove the account.
        await this.accountDao.deleteByEmail(email);
        json(ctx, { message: this.$t.invalidEmail }, 400);
      } catch (error) {
        this.errorReporter.captureException(error as Error);
        json(ctx, { message: this.$t.baseError }, 500);
      }
    }
  }

  async getAccount(ctx: Context): Promise<void> {
    await this.authenticator.let(ctx, this.$t, async (accountId, token) => {
      try {
        const account = await this.accountDao.selectById(accountId);

        if (!account.length) {
          return json(ctx, { message: this.$t.notFound }, 404);
        }

        json(ctx, { ...account[0], token });
      } catch (error) {
        this.errorReporter.captureException(error as Error);
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  async deleteAccount(ctx: Context): Promise<void> {
    // Decision have been made: to delete account, we need token + password
    await this.authenticator.let(ctx, this.$t, async (accountId) => {
      const accountDto = await ctx.request.body.json() as AccountDTO;
      const email = accountDto.email.trim();
      const password = accountDto.password;
      const account = await this.accountDao.selectByEmailWithPassword(email);

      if (account.length === 0) {
        // Not mentionning the fact that the account doesn't exists for security reasons
        return json(ctx, { message: this.$t.wrongCredentials }, 400);
      }

      const isAuthenticated = PasswordService.compare(
        password,
        account[0].password,
      );

      // Token accountId doesn't match database accountId
      if (accountId !== account[0].id) {
        return json(ctx, { message: this.$t.unauthorized }, 401);
      }

      if (!isAuthenticated) {
        return json(ctx, { message: this.$t.wrongCredentials }, 400);
      }

      try {
        await this.accountDao.deleteById(accountId);
        success(ctx);
      } catch (error) {
        this.errorReporter.captureException(error as Error);
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  async confirmAccount(ctx: Context): Promise<void> {
    const confirmDto = await ctx.request.body.json() as ConfirmAccountDTO;
    const email = confirmDto.email.trim();
    const registrationCode = confirmDto.registrationCode;

    try {
      const account = await this.accountDao.selectByEmail(email);

      if (account.length === 0) {
        return json(ctx, { message: this.$t.wrongAccount }, 400);
      }

      if (account[0].registrationCode === null) {
        return json(ctx, { message: this.$t.alreadyConfirmed }, 400);
      }

      const code = parseInt(registrationCode);

      if (isNaN(code) || account[0].registrationCode !== code) {
        return json(ctx, { message: this.$t.wrongRegistrationCode }, 400);
      }

      await this.accountDao.register(email);

      const token = await this.authenticator.createToken({
        header: { alg: "HS512", typ: "JWT" },
        payload: { account_id: account[0].id },
      });

      const lightweight: Record<string, unknown> = { ...account[0] };
      delete lightweight["id"];
      delete lightweight["registrationCode"];

      json(ctx, { ...lightweight, token, email });
    } catch (error) {
      this.errorReporter.captureException(error as Error);
      json(ctx, { message: this.$t.baseError }, 500);
    }
  }

  async recoverAccount(ctx: Context): Promise<void> {
    try {
      const body = await ctx.request.body.json();
      const email = (body.email || "").trim();
      const subject = this.$t.emailSubjectRecover;

      if (await this.isAccountUnique(email)) {
        // We dirty lier. We do not want a hacker know that this particular address does not exists
        return success(ctx);
      }

      const token = await this.authenticator.createToken({
        header: { alg: "HS512", typ: "JWT" },
        payload: {
          reset_password: true,
        },
        expirationMinutes: 60 * 15, // 15 min
      });

      const content =
        `${this.$t.emailContentRecover}<a href="https://cavity.fr/recover.html?token=${token}">Cavity</a>`;

      await this.accountDao.setPendingRecovery(email, token);

      const isDev = Environment.isDevelopmentMode();

      if (!isDev) {
        await sendMail(email, subject, content, this.errorReporter, true);
      } else {
        logger.info(
          `Trying to recover account in dev mode, recovery link: http://cavity.njk.localhost/recover.html?token=${token}`,
        );
      }

      success(ctx);
    } catch (error) {
      this.errorReporter.captureException(error as Error);
      json(ctx, { message: this.$t.baseError }, 500);
    }
  }

  async resetPassword(ctx: Context) {
    const { token, password } = await ctx.request.body.json();

    if (!token) {
      return json(ctx, { message: this.$t.unauthorizedReset }, 401);
    }

    try {
      const { reset_password } = await this.authenticator.verifyToken<{
        reset_password: boolean;
      }>(token);

      if (!reset_password) {
        return success(ctx);
      }

      const securePassword = (password as string).match(this.securePwdRegex);
      const isSecure = securePassword?.length;

      if (!isSecure) {
        return json(ctx, { message: this.$t.weakPassword }, 400);
      }

      const hash = PasswordService.encrypt(password);
      await this.accountDao.recover(hash, token);

      success(ctx);
    } catch (_error) {
      json(ctx, { message: this.$t.unauthorizedReset }, 401);
    }
  }

  async updateLastUser(ctx: Context): Promise<void> {
    await this.authenticator.let(ctx, this.$t, async (accountId) => {
      const { lastUser } = await ctx.request.body.json();
      const time = Date.now();

      try {
        await this.accountDao.updateLastUser(accountId, lastUser, time);
        return success(ctx);
      } catch (error) {
        logger.error(error);
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  private async isAccountUnique(email: string): Promise<boolean> {
    return ((await this.accountDao.selectByEmail(email)).length) === 0;
  }
}
