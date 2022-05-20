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
import { json, success } from "../util/api-response.ts";
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
    const hash = this.hashPassword(password);

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

      await this.sendConfirmMail(account.registrationCode, account.email);
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
    const { id } = getQuery(ctx, { mergeParams: true });
    const parsed = parseInt(id);

    if (isNaN(parsed)) {
      return json(ctx, { message: this.$t.baseError }, 400);
    }

    try {
      const account = await Account
        .where("id", id)
        .get() as Array<Account>;

      if (!account.length) {
        return json(ctx, { message: this.$t.notFound }, 404);
      }

      json(ctx, account[0]);
    } catch (error) {
      json(ctx, { message: this.$t.baseError }, 500);
    }
  }

  async deleteAccount(ctx: Context): Promise<void> {
    inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
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

  private async isAccountUnique(email: string): Promise<boolean> {
    return (await Account.where("email", email).count()) === 0;
  }

  private hashPassword(password: string): string {
    // Using hashSync() instead of hash() because hash() is causing a crash on Deno deploy
    // See https://github.com/denoland/deploy_feedback/issues/171
    return bcrypt.hashSync(password);
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
