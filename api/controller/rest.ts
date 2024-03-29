import { Context, logger, Router } from "../../deps.ts";
import Controller from "./controller.ts";
import inAuthentication from "../util/authenticator.ts";
import { json, success } from "../util/api-response.ts";
import { RestDao } from "../dao/rest-dao.ts";
import { JwtService } from "../service/jwt-service.ts";

interface DataControllerOptions {
  router: Router;
  jwtService: JwtService;
  mapper: DaoMapper;
}

export class DataController extends Controller {
  private jwtService: JwtService;
  private mapper: DaoMapper;

  constructor({ router, jwtService, mapper }: DataControllerOptions) {
    super(router);
    this.jwtService = jwtService;
    this.mapper = mapper;

    // {
    //   "/county": new SupabaseRestDao(this.client, "county"),
    //   "/wine": new SupabaseRestDao(this.client, "wine"),
    //   "/bottle": new SupabaseRestDao(this.client, "bottle"),
    //   "/friend": new SupabaseRestDao(this.client, "friend"),
    //   "/grape": new SupabaseRestDao(this.client, "grape"),
    //   "/review": new SupabaseRestDao(this.client, "review"),
    //   "/qgrape": new SupabaseRestDao(this.client, "q_grape"),
    //   "/freview": new SupabaseRestDao(this.client, "f_review"),
    //   "/history": new SupabaseRestDao(this.client, "history_entry"),
    //   "/tasting": new SupabaseRestDao(this.client, "tasting"),
    //   "/tasting-action": new SupabaseRestDao(this.client, "tasting_action"),
    //   "/history-x-friend": new SupabaseRestDao(this.client, "history_x_friend"),
    //   "/tasting-x-friend": new SupabaseRestDao(this.client, "tasting_x_friend"),
    // };

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

      objects.forEach((object) => object.account_id = accountId);

      try {
        // TODO: supabase-js does not support transactions yet
        // const ok = await transaction([dao], async () => {
        await dao.deleteAllForAccount(accountId);
        await dao.insert(objects);
        // });

        // ok
        //   ? success(ctx)
        //   : json(ctx, { message: this.$t.missingParameters }, 400);

        success(ctx)
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

  private getDao(ctx: Context): RestDao<unknown> {
    const tableName = "/" + ctx.request.url.pathname.split("/").pop() || "";
    return this.mapper[tableName];
  }
}

export interface DaoMapper {
  [route: string]: RestDao<unknown>;
}
