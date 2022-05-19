import { Context, Model, Router } from "../../deps.ts";
import { County } from "../model/county.ts";
import { Wine } from "../model/wine.ts";
import { Bottle } from "../model/bottle.ts";
import { HistoryEntry } from "../model/history-entry.ts";
import { Friend } from "../model/friend.ts";
import { Grape } from "../model/grape.ts";
import { Review } from "../model/review.ts";
import { FReview } from "../model/f-review.ts";
import { QGrape } from "../model/q-grape.ts";
import { Tasting } from "../model/tasting.ts";
import { TastingAction } from "../model/tasting-action.ts";
import { TastingXFriend } from "../model/tasting-x-friend.ts";
import { HistoryXFriend } from "../model/history-x-friend.ts";
import Repository from "../db/repository.ts";
import Controller from "./controller.ts";
import inAuthentication from "../util/authenticator.ts";

export default class DataController extends Controller {
  private jwtKey: CryptoKey;

  constructor(router: Router, repository: Repository, jwtKey: CryptoKey) {
    super(router, repository);
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
        ctx.response.status = 400;
        ctx.response.body = { message: this.$t.missingParameters };
      }

      objects.forEach((object: any) => object.accountId = accountId);

      try {
        await this.repository.doInTransaction(async () => {
          const dao = mapper[this.getMapperEntry(ctx)];

          await dao
            .where("accountId", accountId)
            .delete();

          await dao
            .create(objects);
        });
        ctx.response.body = { ok: true };
      } catch (error) {
        console.log(error);
        ctx.response.status = 500;
        ctx.response.body = { message: this.$t.baseError };
      }
    });
  }

  async handleGet(ctx: Context): Promise<void> {
    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      try {
        const dao = mapper[this.getMapperEntry(ctx)];
        const objects = await dao
          .where("accountId", accountId)
          .get() as Array<Model>;

        objects.forEach((obj: any) => delete obj["accountId"]);

        ctx.response.body = objects;
      } catch (error) {
        console.log(error);
        ctx.response.status = 500;
        ctx.response.body = { message: this.$t.baseError };
      }
    });
  }

  async handleDelete(ctx: Context): Promise<void> {
    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      try {
        const dao = mapper[this.getMapperEntry(ctx)];
        await dao
          .where("accountId", accountId)
          .delete();

        ctx.response.body = { ok: true };
      } catch (error) {
        console.log(error);
        ctx.response.status = 500;
        ctx.response.body = { message: this.$t.baseError };
      }
    });
  }

  private getMapperEntry(ctx: Context): string {
    return ctx.request.url.pathname.split("/").pop() || "";
  }
}

interface PathMapper {
  [path: string]: typeof Model;
}

// Remember to also add Class name in link() in db.ts
const mapper: PathMapper = {
  "/county": County,
  "/wine": Wine,
  "/bottle": Bottle,
  "/friend": Friend,
  "/grape": Grape,
  "/review": Review,
  "/qgrape": QGrape,
  "/freview": FReview,
  "/history": HistoryEntry,
  "/tasting": Tasting,
  "/tasting-action": TastingAction,
  "/history-x-friend": HistoryXFriend,
  "/tasting-x-friend": TastingXFriend,
};
