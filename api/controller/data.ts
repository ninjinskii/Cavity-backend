import { Context, logger, Query, Router, Where } from "../../deps.ts";
import Repository from "../db/repository.ts";
import Controller from "./controller.ts";
import inAuthentication from "../util/authenticator.ts";
import { json, success } from "../util/api-response.ts";
import { pascalToSnake } from "../util/string-util.ts";

export default class DataController extends Controller {
  private jwtKey: CryptoKey;

  constructor(router: Router, repository: Repository, jwtKey: CryptoKey) {
    super(router, repository);
    this.jwtKey = jwtKey;
  }

  handleRequests(): void {
    for (const path of routes) {
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

      objects.forEach((object) => object.account_id = accountId);

      try {
        await this.repository.doInTransaction(async (t) => {
          const table = this.getTargetDbTableName(ctx);

          const query = new Query()
            .delete(table)
            .where(Where.field("account_id").eq(accountId))
            .build();

          const query2 = new Query()
            .table(table)
            .insert(objects.map((o) => pascalToSnake(o as never)))
            .build();

          await this.repository.do(query, t);
          await this.repository.do(query2, t);
        });

        success(ctx);
      } catch (error) {
        logger.error(error);
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  async handleGet(ctx: Context): Promise<void> {
    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      try {
        const table = this.getTargetDbTableName(ctx);

        const query = new Query()
          .table(table)
          .select("*")
          .where(Where.field("account_id").eq(accountId))
          .build();

        const result = await this.repository.do(query);
        const objects = result.rows as Array<never>;

        objects.forEach((obj) => delete obj["account_id"]);

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
        const table = this.getTargetDbTableName(ctx);

        const query = new Query()
          .delete(table)
          .where(Where.field("account_id").eq(accountId))
          .build();

        await this.repository.do(query);

        success(ctx);
      } catch (error) {
        logger.error(error);
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  private getTargetDbTableName(ctx: Context): string {
    return ctx.request.url.pathname.split("/").pop() || "";
  }
}

// TODO rename freview to f_review and qgrape to q_grape
const routes = [
  "/county",
  "/wine",
  "/bottle",
  "/friend",
  "/grape",
  "/review",
  "/qgrape",
  "/freview",
  "/history",
  "/tasting",
  "/tasting-action",
  "/history-x-friend",
  "/tasting-x-friend",
];
