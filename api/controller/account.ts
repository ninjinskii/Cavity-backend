import { Application, bcrypt, Context, jwt, SmtpClient } from "../../deps.ts";
import Repository from "../db/repository.ts";
import { Account, ConfirmAccountDTO } from "../model/account.ts";
import Controller from "./controller.ts";

export default class AccountController extends Controller {
  private jwtKey: CryptoKey;

  constructor(app: Application, repository: Repository, jwtKey: CryptoKey) {
    super(app, repository);
    this.jwtKey = jwtKey;
  }

  get default() {
    return "/account";
  }

  get confirm() {
    return "/account/confirm";
  }

  handleRequests(): void {
    this.app
      .post(this.default, async (ctx: Context) => this.postAccount(ctx))
      .get(this.default, async (ctx: Context) => this.getAccounts(ctx))
      .get(`${this.default}/:id`, async (ctx: Context) => this.getAccount(ctx))
      .delete(
        `${this.default}/:id`,
        async (ctx: Context) => this.deleteAccount(ctx),
      );

    this.app
      .post(this.confirm, async (ctx: Context) => this.confirmAccount(ctx));
  }

  async postAccount(ctx: Context): Promise<void> {
    const { email, password } = await ctx.body as {
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

        console.log(account.registrationCode);
        //await this.sendConfirmMail(account);
        return ctx.json({ ok: true });
      } else {
        return ctx.json({ message: this.$t.accountAlreadyExists }, 400);
      }
    } catch (error) {
      console.log(error);
      try {
        // Mail sending has probably gone wrong. Remove the account.
        Account
          .where("email", email)
          .delete();
        return ctx.json({ message: this.$t.invalidEmail }, 500);
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.$t.baseError }, 500);
      }
    }
  }

  async getAccounts(ctx: Context): Promise<void> {
    try {
      const accounts = await Account.all();
      return ctx.json(accounts);
    } catch (error) {
      return ctx.json({ message: this.$t.baseError }, 500);
    }
  }

  async getAccount(ctx: Context): Promise<void> {
    const { id } = ctx.params;
    const parsed = parseInt(id);

    if (isNaN(parsed)) {
      return ctx.json({ message: this.$t.baseError }, 400);
    }

    try {
      const account = await Account
        .where("id", id)
        .get() as Array<Account>;

      if (account.length) {
        return ctx.json(account[0]);
      } else {
        return ctx.json({ message: this.$t.notFound }, 404);
      }
    } catch (error) {
      return ctx.json({ message: this.$t.baseError }, 500);
    }
  }

  async deleteAccount(ctx: Context): Promise<void> {
    const { id } = ctx.params;
    const parsed = parseInt(id);

    if (isNaN(parsed)) {
      return ctx.json({ message: this.$t.baseError }, 400);
    }

    try {
      await Account
        .where("id", id)
        .delete();
      return ctx.json({ ok: true });
    } catch (error) {
      return ctx.json({ message: this.$t.baseError }, 500);
    }
  }

  async confirmAccount(ctx: Context): Promise<void> {
    const confirmDto = await ctx.body as ConfirmAccountDTO;

    try {
      const account = await Account
        .where("email", confirmDto.email)
        .get() as Array<Account>;

      if (account.length === 0) {
        return ctx.json({ message: this.$t.wrongAccount }, 400);
      }

      if (account[0].registrationCode === null) {
        return ctx.json({ message: this.$t.alreadyConfirmed }, 400);
      }

      const code = parseInt(confirmDto.registrationCode);

      console.log(code)
      console.log(account[0].registrationCode)

      if (account[0].registrationCode === code) {
        await Account
          .where("email", confirmDto.email)
          .update("registrationCode", null);

        const token = await jwt.create(
          { alg: "HS512", typ: "JWT" },
          {
            //exp: jwt.getNumericDate(60 * 60 * 48), // 48h
            account_id: account[0].id,
          },
          this.jwtKey,
        );

        return ctx.json({ token });
      }

      return ctx.json({ message: this.$t.wrongRegistrationCode }, 400);
    } catch (error) {
      return ctx.json({ message: this.$t.baseError }, 500);
    }
  }

  private async isAccountUnique(email: string): Promise<boolean> {
    return (await Account.where("email", email).count()) == 0;
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password);
  }

  private async sendConfirmMail(account: Account) {
    const client = new SmtpClient();
    const { MAIL, MAIL_PASSWORD } = Deno.env.toObject();

    if (!account.registrationCode) {
      throw new Error(`No registration code for account ${account.email}`);
    }

    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: MAIL,
      password: MAIL_PASSWORD,
    });

    await client.send({
      from: MAIL,
      to: account.email as string,
      subject: this.$t.emailSubject,
      content: this.$t.emailContent + account.registrationCode,
    });

    await client.close();
  }
}
