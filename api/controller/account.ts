import { bcrypt, Context, getQuery, jwt, Router } from "../../deps.ts";
import Repository from "../db/repository.ts";
import { Account, ConfirmAccountDTO } from "../model/account.ts";
import { json, success } from "../util/api-response.ts";
import inAuthentication from "../util/authenticator.ts";
import sendMail from "../util/mailer.ts";
import Controller from "./controller.ts";

export default class AccountController extends Controller {
  private jwtKey: CryptoKey;
  private securePwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})/gm

  constructor(router: Router, repository: Repository, jwtKey: CryptoKey) {
    super(router, repository);
    this.jwtKey = jwtKey;
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

  handleRequests(): void {
    this.router
      .post(this.default, (ctx: Context) => this.postAccount(ctx))
      .get(this.default, (ctx: Context) => this.getAccount(ctx))
      .delete(
        `${this.default}/:id`,
        (ctx: Context) => this.deleteAccount(ctx),
      );

    this.router
      .post(this.confirm, (ctx: Context) => this.confirmAccount(ctx))
      .post(this.recover, (ctx: Context) => this.recoverAccount(ctx))
      .post(this.changePassword, (ctx: Context) => this.resetPassword(ctx));
  }

  async postAccount(ctx: Context): Promise<void> {
    const { email, password } = await ctx.request.body().value as {
      email: string;
      password: string;
    };

    const securePassword = (password as string).match(this.securePwdRegex);
    const isSecure = securePassword?.length;

    if (!isSecure) {
      return json(ctx, { message: this.$t.weakPassword }, 400)
    }

    // Using hashSync() instead of hash() because hash() is causing a crash on Deno deploy
    // See https://github.com/denoland/deploy_feedback/issues/171
    const hash = bcrypt.hashSync(password);

    try {
      if (!await this.isAccountUnique(email)) {
        return json(ctx, { message: this.$t.accountAlreadyExists }, 400);
      }

      const account = {
        email,
        password: hash,
        registrationCode: Account.generateRegistrationCode(),
      };

      await Account
        .create(account);

      const subject = this.$t.emailSubject;
      const content = this.$t.emailContent + account.registrationCode;

      await sendMail(account.email, subject, content);
      success(ctx);
    } catch (error) {
      console.log(error);
      try {
        // Mail sending has probably gone wrong. Remove the account.
        Account
          .where("email", email)
          .delete();

        json(ctx, { message: this.$t.invalidEmail }, 400);
      } catch (error) {
        json(ctx, { message: this.$t.baseError }, 500);
      }
    }
  }

  // async getAccounts(ctx: Context): Promise<void> {
  //   try {
  //     const accounts = await Account.all();
  //     ctx.response.body = accounts;
  //   } catch (error) {
  //     ctx.response.status = 500;
  //     ctx.response.body = { message: this.$t.baseError };
  //   }
  // }

  async getAccount(ctx: Context): Promise<void> {
    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      try {
        const account = await Account
          .where("id", accountId)
          .get() as Array<Account>;

        if (!account.length) {
          return json(ctx, { message: this.$t.notFound }, 404);
        }

        let result: any = account[0];
        result.password = undefined;

        json(ctx, result);
      } catch (error) {
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  async deleteAccount(ctx: Context): Promise<void> {
    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      const { id } = getQuery(ctx, { mergeParams: true });
      const parsed = parseInt(id);

      if (isNaN(parsed)) {
        return json(ctx, { message: this.$t.baseError }, 400);
      }

      if (accountId !== parsed) {
        return json(ctx, { message: this.$t.unauthorized }, 401);
      }

      try {
        await Account
          .where("id", id)
          .delete();

        success(ctx);
      } catch (error) {
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  async confirmAccount(ctx: Context): Promise<void> {
    const confirmDto = await ctx.request.body().value as ConfirmAccountDTO;

    try {
      const account = await Account
        .where("email", confirmDto.email)
        .get() as Array<Account>;

      if (account.length === 0) {
        return json(ctx, { message: this.$t.wrongAccount }, 400);
      }

      if (account[0].registrationCode === null) {
        return json(ctx, { message: this.$t.alreadyConfirmed }, 400);
      }

      const code = parseInt(confirmDto.registrationCode);

      if (isNaN(code) || account[0].registrationCode !== code) {
        return json(ctx, { message: this.$t.wrongRegistrationCode }, 400);
      }

      await Account
        .where("email", confirmDto.email)
        .update("registrationCode", null);

      const token = await jwt.create(
        { alg: "HS512", typ: "JWT" },
        {
          exp: jwt.getNumericDate(60 * 60 * 48), // 48h
          account_id: account[0].id,
        },
        this.jwtKey,
      );

      json(ctx, { token });
    } catch (error) {
      json(ctx, { message: this.$t.baseError }, 500);
    }
  }

  async recoverAccount(ctx: Context): Promise<void> {
    try {
      const { email } = await ctx.request.body().value;
      const subject = this.$t.emailSubjectRecover;
      const exists = await Account
        .where("email", email)
        .count();

      if (!exists) {
        // We dirty lier. We do not want a hacker know that this particular address does not exists
        return success(ctx);
      }

      const token = await jwt.create(
        { alg: "HS512", typ: "JWT" },
        {
          exp: jwt.getNumericDate(60 * 15), // 15min
          reset_password: true,
        },
        this.jwtKey,
      );
      const content =
        `${this.$t.emailContentRecover}<a href="https://cavity.fr/recover.html?token=${token}">Cavity</a>`;

      await Account
        .where("email", email)
        .update("resetToken", token);

      await sendMail(email, subject, content, true);

      success(ctx);
    } catch (error) {
      json(ctx, { message: this.$t.baseError }, 500);
    }
  }

  async resetPassword(ctx: Context) {
    const { token, password } = await ctx.request.body().value;

    try {
      const { reset_password } = await jwt.verify(token, this.jwtKey) as {
        reset_password: boolean;
      };

      if (!reset_password) {
        return success(ctx);
      }

      const securePassword = (password as string).match(this.securePwdRegex);
      const isSecure = securePassword?.length;

      if (!isSecure) {
        return json(ctx, { message: this.$t.weakPassword }, 400)
      }

      const hash = bcrypt.hashSync(password);

      await Account
        .where("resetToken", token)
        .update({ password: hash, resetToken: null });

      success(ctx);
    } catch (error) {
      json(ctx, { message: this.$t.unauthorized }, 401);
    }
  }

  private async isAccountUnique(email: string): Promise<boolean> {
    return (await Account.where("email", email).count()) === 0;
  }
}
