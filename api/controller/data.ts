import {
  Context,
  logger,
  QueryBuilder,
  Router,
  transaction,
} from "../../deps.ts";
import Controller from "./controller.ts";
import inAuthentication from "../util/authenticator.ts";
import { json, success } from "../util/api-response.ts";

export default class DataController extends Controller {
  private jwtKey: CryptoKey;

  constructor(router: Router, builder: QueryBuilder, jwtKey: CryptoKey) {
    super(router, builder);
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

      if (!(objects instanceof Array)) {
        return json(ctx, { message: this.$t.missingParameters }, 400);
      }

      if (objects.length === 0) {
        return success(ctx);
      }

      objects.forEach((object) => object.accountId = accountId);
      try {
        const ok = await transaction(this.builder, async () => {
          const table = mapper[this.getMapperEntry(ctx)];
          await this.builder
            .delete()
            .from(table)
            .where({ field: "account_id", equals: accountId })
            .execute();

          await this.builder
            .insert(table, objects)
            .execute();
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
        const table = mapper[this.getMapperEntry(ctx)];
        // We just use this to delete a property on a unknown type. If it doesnt exists nothing changes
        // deno-lint-ignore no-explicit-any
        const objects: any[] = await this.builder
          .select("*")
          .from(table)
          .where({ field: "account_id", equals: accountId })
          .execute();

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
        const table = mapper[this.getMapperEntry(ctx)];
        await this.builder
          .delete()
          .from(table)
          .where({ field: "account_id", equals: accountId });

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

interface RouteMapper {
  [route: string]: string;
}

// Maps route to DB table
const mapper: RouteMapper = {
  "/county": "county",
  "/wine": "wine",
  "/bottle": "bottle",
  "/friend": "friend",
  "/grape": "grape",
  "/review": "review",
  "/qgrape": "q_grape",
  "/freview": "f_review",
  "/history": "history_entry",
  "/tasting": "tasting",
  "/tasting-action": "tasting_action",
  "/history-x-friend": "history_x_friend",
  "/tasting-x-friend": "tasting_x_friend",
};
