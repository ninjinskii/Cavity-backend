import { Bottle } from "../model/bottle.ts";
import { Account } from "../model/account.ts";
import { Client, PostgresClient, PostgresConnector } from "../../deps.ts";
import { County } from "../model/county.ts";
import { Wine } from "../model/wine.ts";
import { FReview } from "../model/f-review.ts";
import { Friend } from "../model/friend.ts";
import { Grape } from "../model/grape.ts";
import { HistoryEntry } from "../model/history-entry.ts";
import { HistoryXFriend } from "../model/history-x-friend.ts";
import { QGrape } from "../model/q-grape.ts";
import { Review } from "../model/review.ts";
import { Tasting } from "../model/tasting.ts";
import { TastingAction } from "../model/tasting-action.ts";
import { TastingXFriend } from "../model/tasting-x-friend.ts";
import { WineImage } from "../model/wine-image.ts";
import { BottlePdf } from "../model/bottle-pdf.ts";

export default class Database {
  private client: Client;
  private DATABASE_URL = Deno.env.get("DATABASE_URL");

  constructor() {
    if (!this.DATABASE_URL) {
      throw Error(
        "Cannot connect to database, do you have set up DATABASE_URL env var ?",
      );
    }

    const connector = new PostgresConnector({
      uri: this.DATABASE_URL,
    });

    this.client = new Client(connector);
  }

  async init(): Promise<void> {
    await this.client.link([
      Account,
      County,
      Wine,
      Bottle,
      Friend,
      Grape,
      Review,
      QGrape,
      FReview,
      HistoryEntry,
      Tasting,
      TastingAction,
      HistoryXFriend,
      TastingXFriend,
      BottlePdf,
      WineImage,
    ]);
    return this.client.sync();
  }

  close(): Promise<void> {
    return this.client.close();
  }

  async doInTransaction(block: () => Promise<void>): Promise<void> {
    // deno-lint-ignore no-explicit-any
    const client = this.client["_connector"]["_client"] as PostgresClient;
    const transaction = client.createTransaction("transaction");

    // deno-lint-ignore no-explicit-any
    this.client["_connector"]["_client"] = transaction;

    await transaction.begin();
    try {
      await block();
    } finally {
      await transaction.commit();
      // deno-lint-ignore no-explicit-any
      this.client["_connector"]["_client"] = client;
    }

    // Waiting for a fix of DenoDB
    //return this.client.transaction(block) as Promise<void>;
  }
}
