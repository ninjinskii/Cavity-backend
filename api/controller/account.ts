import { Application, bcrypt, Context, jwt, SmtpClient, Model } from "../../deps.ts";
import Repository from "../db/repository.ts";
import { Account } from "../model/model.ts";
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
      //.post(this.default, async (ctx: Context) => this.postAccount(ctx))
      // .get(this.default, async (ctx: Context) => this.getAccounts(ctx))
      //.get(`${this.default}/:id`, async (ctx: Context) => this.getAccount(ctx))
      // .delete(
      //   `${this.default}/:id`,
      //   async (ctx: Context) => this.deleteAccount(ctx),
      // );

    // this.app
    //   .post(this.confirm, async (ctx: Context) => this.confirmAccount(ctx));
  }

  // async postAccount(ctx: Context): Promise<void> {
  //   const accountDto = await ctx.body as AccountDTO;
  //   accountDto.password = await this.hashPassword(accountDto.password);

  //   const account = new Account(accountDto);

  //   try {
  //     if (await this.isAccountUnique(account.email)) {
  //       await this.repository.insert("account", [account]);
  //       //await this.sendConfirmMail(account);
  //       return ctx.json({ ok: true });
  //     } else {
  //       return ctx.json({ message: this.$t.accountAlreadyExists }, 400);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     try {
  //       this.repository.delete("account", [{
  //         where: "email",
  //         equals: account.email,
  //       }]);
  //       return ctx.json({ message: this.$t.invalidEmail }, 500);
  //     } catch (error) {
  //       console.warn("Unable to delete account");
  //       return ctx.json({ message: this.$t.baseError }, 500);
  //     }
  //   }
  // }

  // async getAccounts(ctx: Context): Promise<void> {
  //   try {
  //     const accounts = await this.repository.getAll(Account);
  //     return ctx.json(accounts);
  //   } catch (error) {
  //     return ctx.json({ message: this.$t.baseError }, 500);
  //   }
  // }

  // async getAccount(ctx: Context): Promise<void> {
  //   const { id } = ctx.params;
  //   const parsed = parseInt(id);

  //   if (isNaN(parsed)) {
  //     return ctx.json({ message: this.$t.baseError }, 400);
  //   }

  //   try {
  //     const account = await this.repository.select<Account>(
  //       "account",
  //       [{ where: "id", equals: id }],
  //     );

  //     if (account.length) {
  //       return ctx.json(account[0]);
  //     } else {
  //       return ctx.json({ message: this.$t.notFound }, 404);
  //     }
  //   } catch (error) {
  //     return ctx.json({ message: this.$t.baseError }, 500);
  //   }
  // }

  // async deleteAccount(ctx: Context): Promise<void> {
  //   const { id } = ctx.params;
  //   const parsed = parseInt(id);

  //   if (isNaN(parsed)) {
  //     return ctx.json({ message: this.$t.baseError }, 400);
  //   }

  //   try {
  //     await this.repository.delete("account", [{ where: "id", equals: id }]);
  //     return ctx.json({});
  //   } catch (error) {
  //     return ctx.json({ message: this.$t.baseError }, 500);
  //   }
  // }

  // async confirmAccount(ctx: Context): Promise<void> {
  //   const confirmDto = await ctx.body as ConfirmAccountDTO;

  //   try {
  //     const account = await this.repository.select<Account>(
  //       "account",
  //       [{ where: "email", equals: confirmDto.email }],
  //     );

  //     if (account.length === 0) {
  //       return ctx.json({ message: this.$t.wrongAccount }, 400);
  //     }

  //     if (account[0].registration_code === null) {
  //       return ctx.json({ message: this.$t.alreadyConfirmed }, 400);
  //     }

  //     const code = parseInt(confirmDto.registrationCode);

  //     if (account[0].registration_code === code) {
  //       await this.repository.update("account", "registration_code", null, [{
  //         where: "email",
  //         equals: confirmDto.email,
  //       }]);

  //       const token = await jwt.create(
  //         { alg: "HS512", typ: "JWT" },
  //         {
  //           //exp: jwt.getNumericDate(60 * 60 * 48), // 48h
  //           account_id: account[0].id,
  //         },
  //         this.jwtKey,
  //       );

  //       return ctx.json({ token });
  //     }

  //     return ctx.json({ message: this.$t.wrongRegistrationCode }, 400);
  //   } catch (error) {
  //     return ctx.json({ message: this.$t.baseError }, 500);
  //   }
  // }

  // private async isAccountUnique(email: string): Promise<boolean> {
  //   const account = await this.repository.select("account", [{
  //     where: "email",
  //     equals: email,
  //   }]);
  //   return account.length == 0;
  // }

  // private hashPassword(password: string): Promise<string> {
  //   return bcrypt.hash(password);
  // }

  // private async sendConfirmMail(account: Account) {
  //   const client = new SmtpClient();
  //   const { MAIL, MAIL_PASSWORD } = Deno.env.toObject();

  //   if (!account.registration_code) {
  //     throw new Error(`No registration code for account ${account.email}`);
  //   }

  //   await client.connectTLS({
  //     hostname: "smtp.gmail.com",
  //     port: 465,
  //     username: MAIL,
  //     password: MAIL_PASSWORD,
  //   });

  //   await client.send({
  //     from: MAIL,
  //     to: account.email,
  //     subject: this.$t.emailSubject,
  //     content: this.$t.emailContent + account.registration_code,
  //   });

  //   await client.close();
  // }
}
