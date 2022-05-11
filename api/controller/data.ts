import { Application, Context, Model } from "../../deps.ts";
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

  constructor(app: Application, repository: Repository, jwtKey: CryptoKey) {
    super(app, repository);
    this.jwtKey = jwtKey;
  }

  handleRequests(): void {
    for (const path of Object.keys(mapper)) {
      this.app
        .post(path, (ctx: Context) => this.handlePost(ctx))
        .get(path, (ctx: Context) => this.handleGet(ctx))
        .delete(path, (ctx: Context) => this.handleDelete(ctx));
    }
  }

  async handlePost(ctx: Context): Promise<void> {
    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      const objects = await ctx.body;

      if (!(objects instanceof Array)) {
        return ctx.json({ message: this.$t.missingParameters }, 400);
      }

      objects.forEach((object) => object.accountId = accountId);

      try {
        await this.repository.doInTransaction(async () => {
          const dao = mapper[ctx.path];

          await dao
            .where("accountId", accountId)
            .delete();

          await dao
            .create(objects);
        });
        return ctx.json({ ok: true });
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.$t.baseError }, 500);
      }
    });
  }

  async handleGet(ctx: Context): Promise<void> {
    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      try {
        const dao = mapper[ctx.path];
        const objects = await dao
          .where("accountId", accountId)
          .get() as Array<Model>;

        objects.forEach((obj: any) => delete obj["accountId"]);

        return ctx.json(objects);
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.$t.baseError }, 500);
      }
    });
  }

  async handleDelete(ctx: Context): Promise<void> {
    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      try {
        const dao = mapper[ctx.path];
        const objects = await dao
          .where("accountId", accountId)
          .delete();

        return ctx.json({ ok: true });
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.$t.baseError }, 500);
      }
    });
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
