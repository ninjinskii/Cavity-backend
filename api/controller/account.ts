import {
  bcrypt,
  Context,
  getQuery,
  jwt,
  Router,
  SmtpClient,
} from "../../deps.ts";
import Repository from "../db/repository.ts";
import { Account, ConfirmAccountDTO } from "../model/account.ts";
import inAuthentication from "../util/authenticator.ts";
import Controller from "./controller.ts";

export default class AccountController extends Controller {
  private jwtKey: CryptoKey;

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

  handleRequests(): void {
    this.router
      .post(this.default, async (ctx: Context) => this.postAccount(ctx))
      .get(this.default, async (ctx: Context) => this.getAccount(ctx))
      .delete(
        `${this.default}/:id`,
        async (ctx: Context) => this.deleteAccount(ctx),
      );

    this.router
      .post(this.confirm, async (ctx: Context) => this.confirmAccount(ctx));
  }

  async postAccount(ctx: Context): Promise<void> {
    const { email, password } = await ctx.request.body().value as {
      email: string;
      password: string;
    };
    const hash = await this.hashPassword(password);

    try {
      if (await this.isAccountUnique(email)) {
        const account = {
          email,
          password: hash,
          registrationCode: Account.generateRegistrationCode(),
        };

        await Account
          .create(account);

        await this.sendConfirmMail(account.registrationCode, account.email);
        ctx.response.body = { ok: true };
      } else {
        ctx.response.status = 400;
        ctx.response.body = { message: this.$t.accountAlreadyExists };
      }
    } catch (error) {
      console.log(error);
      try {
        // Mail sending has probably gone wrong. Remove the account.
        Account
          .where("email", email)
          .delete();
        ctx.response.status = 500;
        ctx.response.body = { message: this.$t.invalidEmail };
      } catch (error) {
        console.log(error);
        ctx.response.status = 500;
        ctx.response.body = { message: this.$t.baseError };
      }
    }
  }

  // async getAccounts(ctx: Context): Promise<void> {
  //   try {
  //     const accounts = await Account.all();
  //     ctx.response.body = accounts);
  //   } catch (error) {
  //     ctx.response.body = { message: this.$t.baseError }, 500);
  //   }
  // }

  async getAccount(ctx: Context): Promise<void> {
    const { id } = getQuery(ctx, { mergeParams: true });
    const parsed = parseInt(id);

    if (isNaN(parsed)) {
      ctx.response.status = 400;
      ctx.response.body = { message: this.$t.baseError };
    }

    try {
      const account = await Account
        .where("id", id)
        .get() as Array<Account>;

      if (account.length) {
        ctx.response.body = account[0];
      } else {
        ctx.response.status = 404;
        ctx.response.body = { message: this.$t.notFound }, 404;
      }
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = { message: this.$t.baseError }, 500;
    }
  }

  async deleteAccount(ctx: Context): Promise<void> {
    inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      const { id } = getQuery(ctx, { mergeParams: true });
      const parsed = parseInt(id);

      if (isNaN(parsed)) {
        ctx.response.status = 400;
        ctx.response.body = { message: this.$t.baseError };
      }

      if (accountId !== parsed) {
        ctx.response.body = { message: this.$t.unauthorized }, 401;
      }

      try {
        await Account
          .where("id", id)
          .delete();
        ctx.response.body = { ok: true };
      } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { message: this.$t.baseError }, 500;
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
        ctx.response.status = 400;
        ctx.response.body = { message: this.$t.wrongAccount };
      }

      if (account[0].registrationCode === null) {
        ctx.response.status = 400;
        ctx.response.body = { message: this.$t.alreadyConfirmed };
      }

      const code = parseInt(confirmDto.registrationCode);

      if (account[0].registrationCode === code) {
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

        ctx.response.body = { token };
      }

      ctx.response.status = 400;
      ctx.response.body = { message: this.$t.wrongRegistrationCode }, 400;
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = { message: this.$t.baseError }, 500;
    }
  }

  private async isAccountUnique(email: string): Promise<boolean> {
    return (await Account.where("email", email).count()) == 0;
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password);
  }

  private async sendConfirmMail(
    registrationCode: number,
    email: string,
  ): Promise<void> {
    const client = new SmtpClient();
    const { MAIL, MAIL_PASSWORD } = Deno.env.toObject();

    if (!registrationCode) {
      throw new Error(`No registration code for account ${email}`);
    }

    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: MAIL,
      password: MAIL_PASSWORD,
    });

    await client.send({
      from: MAIL,
      to: email as string,
      subject: this.$t.emailSubject,
      content: this.$t.emailContent + registrationCode,
    });

    await client.close();
  }
}
