import { Client, Context, logger, Router, transaction } from "../../deps.ts";
import Controller from "./controller.ts";
import inAuthentication from "../util/authenticator.ts";
import { json, success } from "../util/api-response.ts";
import { DataDao } from "../dao/rest-dao.ts";
import { mapper } from "../main.ts";

export default class DataController extends Controller {
  private jwtKey: CryptoKey;

  constructor(router: Router, client: Client, jwtKey: CryptoKey) {
    super(router, client);
    this.jwtKey = jwtKey;
  }

  handleRequests(): void {
    for (const path of Object.keys(mapper)) {
      this.router
        .post(path, (ctx: Context) => this.handlePost(ctx))
        .get(path, (ctx: Context) => this.handleGet(ctx))
        .delete(path, (ctx: Context) => this.handleDelete(ctx));
    }
  }

  async handlePost(ctx: Context): Promise<void> {
    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      const objects = await ctx.request.body().value;
      const dao = mapper[this.getMapperEntry(ctx)];

      if (!(objects instanceof Array)) {
        return json(ctx, { message: this.$t.missingParameters }, 400);
      }

      if (objects.length === 0) {
        try {
          await dao.deleteAllForAccount(accountId);
        } catch (error) {
          logger.error(error);
          json(ctx, { message: this.$t.baseError }, 500);
        }

        return success(ctx);
      }

      objects.forEach((object) => object.accountId = accountId);

      try {
        const ok = await transaction([dao], async () => {
          await dao.deleteAllForAccount(accountId);
          await dao.insert(objects);
        });

        ok
          ? success(ctx)
          : json(ctx, { message: this.$t.missingParameters }, 400);
      } catch (error) {
        logger.error(error);
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  async handleGet(ctx: Context): Promise<void> {
    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      try {
        const dao = mapper[this.getMapperEntry(ctx)];
        // We just use this to delete a property on a unknown type. If it doesnt exists nothing changes
        // deno-lint-ignore no-explicit-any
        const objects = await dao.selectByAccountId(accountId) as any[];
        objects.forEach((obj) => delete obj["accountId"]);

        json(ctx, objects);
      } catch (error) {
        logger.error(error);
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  async handleDelete(ctx: Context): Promise<void> {
    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      try {
        const dao = mapper[this.getMapperEntry(ctx)];
        await dao.deleteAllForAccount(accountId);

        success(ctx);
      } catch (error) {
        logger.error(error);
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  private getMapperEntry(ctx: Context): string {
    return "/" + ctx.request.url.pathname.split("/").pop() || "";
  }
}

export interface DaoMapper {
  [route: string]: DataDao<unknown>;
}
