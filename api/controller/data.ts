import { Application, Context, jwt, Transaction } from "../../deps.ts";
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
      this.app.post(path, (ctx: Context) => this.handlePost(ctx));
      this.app.get(path, (ctx: Context) => this.handleGet(ctx));
      this.app.delete(path, (ctx: Context) => this.handleDelete(ctx));
    }
  }

  async handlePost(ctx: Context): Promise<void> {
    inAuthentication(ctx, this.jwtKey, this.translator, async (accountId) => {
      const dtoList = await ctx.body;
      if (!(dtoList instanceof Array)) {
        return ctx.json({ message: this.translator.missingParameters }, 400);
      }

      const objects = dtoList.map((dto) =>
        mapper[ctx.path].fromDTO(dto, accountId)
      );

      try {
        await this.repository.doInTransaction(
          `postCounty-${accountId}`,
          async (t: Transaction) => {
            await this.repository.deleteBy(
              mapper[ctx.path].table,
              "account_id",
              accountId.toString(),
              t,
            );
            await this.repository.insert(mapper[ctx.path].table, objects, t);
          },
        );
        return ctx.json({ ok: true });
      } catch (error) {
        console.log(error);
        console.warn("Unable to insert objects");
        return ctx.json({ message: this.translator.baseError }, 500);
      }
    });
  }

  async handleGet(ctx: Context): Promise<void> {
    inAuthentication(ctx, this.jwtKey, this.translator, async (accountId) => {
      try {
        const objects = await this.repository.selectBy(
          mapper[ctx.path].table,
          "account_id",
          accountId.toString(),
        );

        const dtoList = objects.map((object) => mapper[ctx.path].toDTO(object));

        return ctx.json(dtoList);
      } catch (error) {
        console.log(error);
        console.warn("Unable to get counties");
        return ctx.json({ message: this.translator.baseError }, 500);
      }
    });
  }

  async handleDelete(ctx: Context): Promise<void> {
    inAuthentication(ctx, this.jwtKey, this.translator, async (accountId) => {
      try {
        await this.repository.deleteBy(
          mapper[ctx.path].table,
          "account_id",
          accountId.toString(),
        );

        return ctx.json({ ok: true });
      } catch (error) {
        console.log(error);
        console.warn("Unable to delete objects");
        return ctx.json({ message: this.translator.baseError }, 500);
      }
    });
  }
}

// Can replace these two pieces by splitting up this controller by data object
// and add a super class that require a table name and a function to transform
// their objects to DTOs.
interface PathMapper {
  [path: string]: {
    table: string;
    toDTO: (object: any) => any;
    fromDTO: (dto: any, account_id: number) => any;
  };
}

const mapper: PathMapper = {
  "/county": {
    table: "county",
    toDTO: County.toDTO,
    fromDTO: (dto, accountId) => new County(dto, accountId),
  },
  "/wine": {
    table: "wine",
    toDTO: Wine.toDTO,
    fromDTO: (dto, accountId) => new Wine(dto, accountId),
  },
  "/bottle": {
    table: "bottle",
    toDTO: Bottle.toDTO,
    fromDTO: (dto, accountId) => new Bottle(dto, accountId),
  },
  "/history": {
    table: "history_entry",
    toDTO: HistoryEntry.toDTO,
    fromDTO: (dto, accountId) => new HistoryEntry(dto, accountId),
  },
  "/friend": {
    table: "friend",
    toDTO: Friend.toDTO,
    fromDTO: (dto, accountId) => new Friend(dto, accountId),
  },
  "/grape": {
    table: "grape",
    toDTO: Grape.toDTO,
    fromDTO: (dto, accountId) => new Grape(dto, accountId),
  },
  "/review": {
    table: "review",
    toDTO: Review.toDTO,
    fromDTO: (dto, accountId) => new Review(dto, accountId),
  },
  "/qgrape": {
    table: "q_grape",
    toDTO: QGrape.toDTO,
    fromDTO: (dto, accountId) => new QGrape(dto, accountId),
  },
  "/freview": {
    table: "f_review",
    toDTO: FReview.toDTO,
    fromDTO: (dto, accountId) => new FReview(dto, accountId),
  },
  "/tasting": {
    table: "tasting",
    toDTO: Tasting.toDTO,
    fromDTO: (dto, accountId) => new Tasting(dto, accountId),
  },
  "/tasting-action": {
    table: "tasting_action",
    toDTO: TastingAction.toDTO,
    fromDTO: (dto, accountId) => new TastingAction(dto, accountId),
  },
  "/tasting-x-friend": {
    table: "tasting_x_friend",
    toDTO: TastingXFriend.toDTO,
    fromDTO: (dto, accountId) => new TastingXFriend(dto, accountId),
  },
  "/history-x-friend": {
    table: "history_x_friend",
    toDTO: HistoryXFriend.toDTO,
    fromDTO: (dto, accountId) => new HistoryXFriend(dto, accountId),
  },
};
