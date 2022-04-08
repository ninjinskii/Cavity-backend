import { PostgresClient, QueryObjectResult } from "../deps.ts";

export default class Database {
  private client: PostgresClient;

  constructor() {
    const DATABASE_URL = Deno.env.get("DATABASE_URL");
    this.client = new PostgresClient(DATABASE_URL);
    // this.client = new PostgresClient({
    //   database: "cavity",
    //   hostname: "db",
    //   password: "plout",
    //   port: 5432,
    //   user: "postgres",
    //   tls: {
    //     enforce: false,
    //   }
    // });
  }

  async connect() {
    await this.client.connect();
  }

  async close() {
    await this.client.end();
  }

  async doQuery(query: string): Promise<QueryObjectResult<unknown>> {
    return await this.client.queryObject(query);
  }
}
