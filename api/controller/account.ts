import { Where } from "https://deno.land/x/sql_builder@v1.9.1/where.ts";
import {
  bcrypt,
  Context,
  getQuery,
  jwt,
  logger,
  Query,
  Router,
} from "../../deps.ts";
import Repository from "../db/repository.ts";
import {
  Account,
  ConfirmAccountDTO,
  generateRegistrationCode,
} from "../model/account.ts";
import { json, success } from "../util/api-response.ts";
import inAuthentication from "../util/authenticator.ts";
import sendMail from "../util/mailer.ts";
import pascalToSnake from "../util/pascal-to-snake.js";
import Controller from "./controller.ts";

export default class AccountController extends Controller {
  private jwtKey: CryptoKey;
  private securePwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})/gm;

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
      return json(ctx, { message: this.$t.weakPassword }, 400);
    }

    // Using hashSync() instead of hash() because hash() is causing a crash on Deno deploy
    // See https://github.com/denoland/deploy_feedback/issues/171
    const hash = bcrypt.hashSync(password);

    try {
      if (!await this.isAccountUnique(email)) {
        return json(ctx, { message: this.$t.accountAlreadyExists }, 400);
      }

      const account: Account = {
        email,
        password: hash,
        registrationCode: generateRegistrationCode(),
      };

      const query = new Query()
        .table("account")
        .insert(pascalToSnake(account))
        .build();

      await this.repository.do(query);

      const subject = this.$t.emailSubject;
      const content = this.$t.emailContent + account.registrationCode;

      await sendMail(account.email, subject, content);
      success(ctx);
    } catch (error) {
      logger.error(error);
      try {
        // Mail sending has probably gone wrong. Remove the account.
        const query = new Query()
          .delete("account")
          .where(Where.field("email").eq(email))
          .build();

        await this.repository.do(query);

        json(ctx, { message: this.$t.invalidEmail }, 400);
      } catch (_error) {
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
        const query = new Query()
          .table("account")
          .select("id", "email", "registration_code")
          .where(Where.field("id").eq(accountId))
          .build();

        const result = await this.repository.do<Account>(query);

        if (!result.rows.length) {
          return json(ctx, { message: this.$t.notFound }, 404);
        }

        const account: Account = result.rows[0];
        json(ctx, account);
      } catch (_error) {
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
        const query = new Query()
          .delete("account")
          .where(Where.field("id").eq(id))
          .build();

        await this.repository.do(query);

        success(ctx);
      } catch (_error) {
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  async confirmAccount(ctx: Context): Promise<void> {
    const confirmDto = await ctx.request.body().value as ConfirmAccountDTO;

    try {
      const query = new Query()
        .table("account")
        .select("*")
        .where(Where.field("email").eq(confirmDto.email))
        .build();

      const response = await this.repository.do<Account>(query);

      if (response.rows.length === 0) {
        return json(ctx, { message: this.$t.wrongAccount }, 400);
      }

      const account = response.rows[0];

      if (account.registrationCode === null) {
        return json(ctx, { message: this.$t.alreadyConfirmed }, 400);
      }

      const code = parseInt(confirmDto.registrationCode);

      if (isNaN(code) || account.registrationCode !== code) {
        return json(ctx, { message: this.$t.wrongRegistrationCode }, 400);
      }

      const query2 = new Query()
        .table("account")
        .update({ registration_code: null })
        .where(Where.field("email").eq(confirmDto.email))
        .build();

      await this.repository.do(query2);

      const token = await jwt.create(
        { alg: "HS512", typ: "JWT" },
        {
          exp: jwt.getNumericDate(60 * 60 * 48), // 48h
          account_id: account.id,
        },
        this.jwtKey,
      );

      json(ctx, { token });
    } catch (_error) {
      json(ctx, { message: this.$t.baseError }, 500);
    }
  }

  async recoverAccount(ctx: Context): Promise<void> {
    try {
      const { email } = await ctx.request.body().value;
      const subject = this.$t.emailSubjectRecover;
      const query = new Query()
        .table("account")
        .where(Where.field("email").eq(email))
        .build();

      const response = await this.repository.do(query);
      const exists = response.rows.length;

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

      const query2 = new Query()
        .table("account")
        .where(Where.field("email").eq(email))
        .update({ reset_token: token })
        .build();

      await this.repository.do(query2);
      await sendMail(email, subject, content, true);

      success(ctx);
    } catch (_error) {
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
        return json(ctx, { message: this.$t.weakPassword }, 400);
      }

      const hash = bcrypt.hashSync(password);

      const query = new Query()
        .table("account")
        .where(Where.field("reset_token").eq(token))
        .update({ password: hash, reset_token: null })
        .build();

      await this.repository.do(query);

      success(ctx);
    } catch (_error) {
      json(ctx, { message: this.$t.unauthorized }, 401);
    }
  }

  private async isAccountUnique(email: string): Promise<boolean> {
    const query = new Query()
      .table("account")
      .select("email")
      .where(Where.field("email").eq(email))
      .build();

    const response = await this.repository.do(query);
    return response.rows.length === 0;
  }
}
