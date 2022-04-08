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
      this.repository.insert("account", account);
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
        parsed,
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
      await this.repository.deleteBy("account", "id", parsed);
    } catch (error) {
      return ctx.json({ message: this.translator.baseError }, 500);
    }
  }
}
