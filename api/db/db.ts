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

export default class Database {
  private client: Client;
  private DATABASE_URL = Deno.env.get("DATABASE_URL");

  constructor() {
    if (!this.DATABASE_URL) {
      throw Error(
        "Cannot connect to database, do you have set up DATABASE_URL env var ?",
      );
    }

    const connector = new PostgresConnector({ uri: this.DATABASE_URL });
    this.client = new Client(connector);

    // const cert = Deno.readTextFileSync(
    //   new URL("../../prod-ca-2021.crt", import.meta.url),
    // );

    // this.client = new Client(connector);
    // this.client["_connector"]["_client"] = new PostgresClient({
    //   database: "postgres",
    //   hostname: "db.pyjhfmsgwwdcdcmyiffc.supabase.co",
    //   host_type: "tcp",
    //   port: 5432,
    //   user: "postgres",
    //   tls: {
    //     enabled: false,
    //     //caCertificates: [cert]
    //   },
    // });
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
      await transaction.commit();
    } finally {
      // deno-lint-ignore no-explicit-any
      this.client["_connector"]["_client"] = client;
    }

    // Waiting for a fix of DenoDB
    //return this.client.transaction(block) as Promise<void>;
  }
}
