import { Context } from "../../deps.ts";
import { Account, AccountDTO } from "../model/account.ts";
import Controller from "./controller.ts";

export default class AccountController extends Controller {
  path = "/account";

  handleRequests(): void {
    this.app
      .post(this.path, async (ctx: Context) => this.postAccount(ctx))
      .get(this.path, async (ctx: Context) => this.getAccounts(ctx))
      .get(`${this.path}/:id`, async (ctx: Context) => this.getAccount(ctx))
      .delete(
        `${this.path}/:id`,
        async (ctx: Context) => this.deleteAccount(ctx),
      );
  }

  async postAccount(ctx: Context): Promise<void> {
    const accountDto = await ctx.body as AccountDTO;
    const account = new Account(accountDto);

    try {
      if (await this.isAccountUnique(account.email)) {
        this.repository.insert("account", account);
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
    } catch (error) {
      return ctx.json({ message: this.translator.baseError }, 500);
    }
  }

  private async isAccountUnique(email: string): Promise<boolean> {
    const account = await this.repository.selectBy("account", "email", email);
    return account.length == 0;
  }
}
