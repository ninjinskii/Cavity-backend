import { Bottle } from "../model/bottle.ts";
import { Account } from "../model/model.ts";
import {
  Client,
  PostgresClient,
  PostgresConnector,
  QueryObjectResult,
  Transaction,
} from "../../deps.ts";
import { County } from "../model/county.ts";

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
    // TODO: add model classes
    await this.client.link([Account, County, Bottle]);
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
      await block()
    } finally {
      await transaction.commit();
      // deno-lint-ignore no-explicit-any
      this.client["_connector"]["_client"] = client;
    }


    // Waiting for a fix of DenoDB
    //return this.client.transaction(block) as Promise<void>;
  }
}
