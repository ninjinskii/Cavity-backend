import { Bottle } from "../model/bottle.ts"
import { Account } from "../model/model.ts"
import {
  Client,
  PostgresConnector,
  QueryObjectResult,
  Transaction,
} from "../../deps.ts";

export default class Database {
  private client: Client;
  // TODO update env vars
  private DATABASE_URL = Deno.env.get("DATABASE_URL");

  constructor() {
    const connector = new PostgresConnector({
      database: "cavity",
      host: "db",
      username: "postgres",
      password: "plout",
      port: 5432,
    });

    this.client = new Client(connector);
    console.log("close");
    this.client.close();
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
