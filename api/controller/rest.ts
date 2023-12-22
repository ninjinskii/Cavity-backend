import { Client, Context, logger, Router, transaction } from "../../deps.ts";
import Controller from "./controller.ts";
import inAuthentication from "../util/authenticator.ts";
import { json, success } from "../util/api-response.ts";
import { DataDao } from "../dao/rest-dao.ts";
import { JwtService } from "../service/jwt-service.ts";

interface DataControllerOptions {
  router: Router;
  client: Client;
  jwtService: JwtService;
}

export class DataController extends Controller {
  private jwtService: JwtService;
  private mapper: DaoMapper;

  constructor({ router, client, jwtService }: DataControllerOptions) {
    super(router, client);
    this.jwtService = jwtService;
    this.mapper = {
      "/county": new DataDao(this.client, "county"),
      "/wine": new DataDao(this.client, "wine"),
      "/bottle": new DataDao(this.client, "bottle"),
      "/friend": new DataDao(this.client, "friend"),
      "/grape": new DataDao(this.client, "grape"),
      "/review": new DataDao(this.client, "review"),
      "/qgrape": new DataDao(this.client, "q_grape"),
      "/freview": new DataDao(this.client, "f_review"),
      "/history": new DataDao(this.client, "history_entry"),
      "/tasting": new DataDao(this.client, "tasting"),
      "/tasting-action": new DataDao(this.client, "tasting_action"),
      "/history-x-friend": new DataDao(this.client, "history_x_friend"),
      "/tasting-x-friend": new DataDao(this.client, "tasting_x_friend"),
    };

    this.handleRequests()
  }

  handleRequests(): void {
    for (const path of Object.keys(this.mapper)) {
      this.router
        .post(path, (ctx: Context) => this.handlePost(ctx))
        .get(path, (ctx: Context) => this.handleGet(ctx))
        .delete(path, (ctx: Context) => this.handleDelete(ctx));
    }
  }

  async handlePost(ctx: Context): Promise<void> {
    await inAuthentication(ctx, this.jwtService, this.$t, async (accountId) => {
      logger.info(`POST: requested by ${accountId}`);

      const objects = await ctx.request.body().value;
      const dao = this.getDao(ctx);

      if (!(objects instanceof Array)) {
        return json(ctx, { message: this.$t.missingParameters }, 400);
      }

      if (objects.length === 0) {
        try {
          await dao.deleteAllForAccount(accountId);
        } catch (error) {
          logger.error(error);
          return json(ctx, { message: this.$t.baseError }, 500);
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
    await inAuthentication(ctx, this.jwtService, this.$t, async (accountId) => {
      logger.info(`GET: requested by ${accountId}`);

      try {
        const dao = this.getDao(ctx);
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
    await inAuthentication(ctx, this.jwtService, this.$t, async (accountId) => {
      logger.info(`DELETE: requested by ${accountId}`);

      try {
        const dao = this.getDao(ctx);
        await dao.deleteAllForAccount(accountId);

        success(ctx);
      } catch (error) {
        logger.error(error);
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  private getDao(ctx: Context): DataDao<unknown> {
    const tableName = "/" + ctx.request.url.pathname.split("/").pop() || "";
    return this.mapper[tableName];
  }
}

interface DaoMapper {
  [route: string]: DataDao<unknown>;
}
