import { Application, Context, jwt, Model, Transaction } from "../../deps.ts";
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
import { Account, Dao } from "../model/model.ts";

export default class DataController extends Controller {
  private jwtKey: CryptoKey;

  constructor(app: Application, repository: Repository, jwtKey: CryptoKey) {
    super(app, repository);
    this.jwtKey = jwtKey;
  }

  handleRequests(): void {
    for (const path of Object.keys(mapper)) {
      this.app.post(path, (ctx: Context) => this.handlePost(ctx));
      // this.app.get(path, (ctx: Context) => this.handleGet(ctx));
      // this.app.delete(path, (ctx: Context) => this.handleDelete(ctx));
    }
  }

  async handlePost(ctx: Context): Promise<void> {
    // await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
    //   const dtoList = await ctx.body;
    //   if (!(dtoList instanceof Array)) {
    //     return ctx.json({ message: this.$t.missingParameters }, 400);
    //   }

      // const objects = dtoList.map((dto) =>
      //   mapper[ctx.path].fromDTO(dto, accountId)
      // );

      try {
        await this.repository.doInTransaction(
          `postCounty`,
          async () => {
            const a = await mapper["/county"].dao.all()
            console.log(a);

            // await this.repository.delete(
            //   mapper[ctx.path].table,
            //   [{ where: "account_id", equals: accountId.toString() }],
            //   t,
            // );
            // await this.repository.insert(mapper[ctx.path].table, objects, t);
          },
        );
        return ctx.json({ ok: true });
      } catch (error) {
        console.log(error);
        console.warn("Unable to insert objects");
        return ctx.json({ message: this.$t.baseError }, 500);
      }
    // });
  }

  // async handleGet(ctx: Context): Promise<void> {
  //   await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
  //     try {
  //       const objects = await this.repository.select(
  //         mapper[ctx.path].table,
  //         [{ where: "account_id", equals: accountId.toString() }],
  //       );

  //       const dtoList = objects.map((object) => mapper[ctx.path].toDTO(object));

  //       return ctx.json(dtoList);
  //     } catch (error) {
  //       console.log(error);
  //       console.warn("Unable to get counties");
  //       return ctx.json({ message: this.$t.baseError }, 500);
  //     }
  //   });
  // }

  // async handleDelete(ctx: Context): Promise<void> {
  //   await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
  //     try {
  //       await this.repository.delete(
  //         mapper[ctx.path].table,
  //         [{ where: "account_id", equals: accountId.toString() }],
  //       );

  //       return ctx.json({ ok: true });
  //     } catch (error) {
  //       console.log(error);
  //       console.warn("Unable to delete objects");
  //       return ctx.json({ message: this.$t.baseError }, 500);
  //     }
  //   });
  // }
}

// Can replace these two pieces by splitting up this controller by data object
// and add a super class that require a table name and a function to transform
// their objects to DTOs.
interface PathMapper {
  [path: string]: {
    dao: Dao
  };
}

const mapper: PathMapper = {
  "/county": {
    dao: new Account()
  },
};
