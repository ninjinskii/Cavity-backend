import { PostgresClient, QueryObjectResult } from "../../deps.ts";

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

  connect(): Promise<void> {
    return this.client.connect();
  }

  close(): Promise<void> {
    return this.client.end();
  }

  doQuery(query: string): Promise<QueryObjectResult<unknown>> {
    return this.client.queryObject(query);
  }

  async doInTransaction(name: string, block: () => void): Promise<void> {
    const transaction = this.client.createTransaction(name);

    await transaction.begin();
    await block();
    await transaction.commit();
  }
}
