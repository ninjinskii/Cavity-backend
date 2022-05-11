import { Bottle } from "../model/bottle.ts";
import { Account } from "../model/model.ts";
import {
  Client,
  PostgresConnector,
  QueryObjectResult,
  Transaction,
} from "../../deps.ts";

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
    await this.client.link([Account, Bottle]);
    return this.client.sync();
  }

  close(): Promise<void> {
    return this.client.close();
  }

  doInTransaction(block: () => Promise<void>): Promise<void> {
    return this.client.transaction(block) as Promise<void>;
  }
}
