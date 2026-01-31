import { Context, Router } from "@oak/oak";
import * as logger from "@std/log";
import Controller from "./controller.ts";
import { Authenticator } from "../infrastructure/authenticator.ts";
import { json, success } from "../util/api-response.ts";
import { RestDao } from "../dao/rest-dao.ts";
import { ErrorReporter } from "../infrastructure/error-reporter.ts";

interface DataControllerOptions {
  router: Router;
  mapper: DaoMapper;
  errorReporter: ErrorReporter;
  authenticator: Authenticator;
}

export class DataController extends Controller {
  private mapper: DaoMapper;
  private errorReporter: ErrorReporter;
  private authenticator: Authenticator;

  constructor(
    { router, mapper, errorReporter, authenticator }: DataControllerOptions,
  ) {
    super(router);
    this.mapper = mapper;
    this.errorReporter = errorReporter;
    this.authenticator = authenticator;

    this.handleRequests();
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
    await this.authenticator.let(ctx, this.$t, async (accountId) => {
      logger.info(`POST: requested by ${accountId}`);

      const objects = await ctx.request.body.json();
      const dao = this.getDao(ctx);

      if (!dao) {
        return json(ctx, { message: this.$t.notFound }, 404);
      }

      if (!(objects instanceof Array)) {
        return json(ctx, { message: this.$t.missingParameters }, 400);
      }

      objects.forEach((object) => object.account_id = accountId);

      try {
        await dao.replaceAllForAccount(accountId, objects);
        success(ctx);
      } catch (error) {
        this.errorReporter.captureException(error as Error);
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  async handleGet(ctx: Context): Promise<void> {
    await this.authenticator.let(ctx, this.$t, async (accountId) => {
      logger.info(`GET: requested by ${accountId}`);

      try {
        const dao = this.getDao(ctx);

        if (!dao) {
          return json(ctx, { message: this.$t.notFound }, 404);
        }

        // We just use this to delete a property on a unknown type. If it doesnt exists nothing changes
        // deno-lint-ignore no-explicit-any
        const objects = await dao.selectByAccountId(accountId) as any[];
        objects.forEach((obj) => delete obj["accountId"]);

        json(ctx, objects);
      } catch (error) {
        this.errorReporter.captureException(error as Error);
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  async handleDelete(ctx: Context): Promise<void> {
    await this.authenticator.let(ctx, this.$t, async (accountId) => {
      logger.info(`DELETE: requested by ${accountId}`);

      try {
        const dao = this.getDao(ctx);

        if (!dao) {
          return json(ctx, { message: this.$t.notFound }, 404);
        }

        await dao.deleteAllForAccount(accountId);

        success(ctx);
      } catch (error) {
        this.errorReporter.captureException(error as Error);
        json(ctx, { message: this.$t.baseError }, 500);
      }
    });
  }

  private getDao(ctx: Context): RestDao<unknown> | undefined {
    const tableName = "/" + ctx.request.url.pathname.split("/").pop() || "";
    return this.mapper[tableName];
  }
}

export interface DaoMapper {
  [route: string]: RestDao<unknown>;
}
