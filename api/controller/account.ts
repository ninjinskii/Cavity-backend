import { Context, SmtpClient } from "../../deps.ts";
import { Account, AccountDTO, ConfirmAccountDTO } from "../model/account.ts";
import Controller from "./controller.ts";

export default class AccountController extends Controller {
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
    const accountDto = await ctx.body as AccountDTO;
    const account = new Account(accountDto);

    try {
      if (await this.isAccountUnique(account.email)) {
        this.repository.insert("account", account);
        await this.sendConfirmMail(account);
      } else {
        return ctx.json({ message: this.translator.accountAlreadyExists }, 400);
      }
      return ctx.json(account);
    } catch (error) {
      return ctx.json({ message: this.translator.baseError }, 500);
    }
  }

  async getAccounts(ctx: Context): Promise<void> {
    try {
      const accounts = await this.repository.select<Account>("account");
      return ctx.json(accounts);
    } catch (error) {
      return ctx.json({ message: this.translator.baseError }, 500);
    }
  }

  async getAccount(ctx: Context): Promise<void> {
    const { id } = ctx.params;
    const parsed = parseInt(id);

    if (isNaN(parsed)) {
      return ctx.json({ message: this.translator.baseError }, 400);
    }

    try {
      const account = await this.repository.selectBy<Account>(
        "account",
        "id",
        id,
      );

      if (account.length) {
        return ctx.json(account[0]);
      } else {
        return ctx.json({ message: this.translator.notFound }, 404);
      }
    } catch (error) {
      return ctx.json({ message: this.translator.baseError }, 500);
    }
  }

  async deleteAccount(ctx: Context): Promise<void> {
    const { id } = ctx.params;
    const parsed = parseInt(id);

    if (isNaN(parsed)) {
      return ctx.json({ message: this.translator.baseError }, 400);
    }

    try {
      await this.repository.deleteBy("account", "id", id);
      return ctx.json({});
    } catch (error) {
      return ctx.json({ message: this.translator.baseError }, 500);
    }
  }

  async confirmAccount(ctx: Context): Promise<void> {
    const confirmDto = await ctx.body as ConfirmAccountDTO;

    try {
      const account = await this.repository.selectBy<Account>(
        "account",
        "email",
        confirmDto.email,
      );

      if (account.length === 0) {
        return ctx.json({ message: this.translator.wrongAccount }, 400);
      }

      if (account[0].registration_code === null) {
        return ctx.json({ message: this.translator.alreadyConfirmed }, 400);
      }

      const code = parseInt(confirmDto.registrationCode);

      if (account[0].registration_code === code) {
        await this.repository.update("account", "registration_code", null, {
          filter: "email",
          value: confirmDto.email,
        });

        const updated = {
          ...account[0],
          registration_code: null,
          password: undefined,
        };

        return ctx.json(updated);
      }

      return ctx.json({ message: this.translator.wrongRegistrationCode }, 400);
    } catch (error) {
      return ctx.json({ message: this.translator.baseError }, 500);
    }
  }

  private async isAccountUnique(email: string): Promise<boolean> {
    const account = await this.repository.selectBy("account", "email", email);
    return account.length == 0;
  }

  private async sendConfirmMail(account: Account) {
    const client = new SmtpClient();
    const { MAIL, MAIL_PASSWORD } = Deno.env.toObject();

    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: MAIL,
      password: MAIL_PASSWORD,
    });

    // TODO: replace with true mail
    await client.send({
      from: MAIL,
      to: "louiszimbabwe@gmail.com",
      subject: "Hello mom",
      content: account.registration_code?.toString() || "erreur",
    });

    await client.close();
  }
}
