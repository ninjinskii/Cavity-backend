import { PostgresClient, QueryObjectResult, Transaction } from "../../deps.ts";

export default class Database {
  private client: PostgresClient;
  private DATABASE_URL = Deno.env.get("DATABASE_URL");

  constructor() {
    this.client = new PostgresClient(this.DATABASE_URL);
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

  doQuery(
    query: string,
    t: Transaction | null = null,
  ): Promise<QueryObjectResult<unknown>> {
    return (t || this.client).queryObject(query);
  }

  async doInTransaction(
    name: string,
    block: (t: Transaction) => Promise<void>,
  ): Promise<void> {
    const transaction = this.client.createTransaction(name);

    await transaction.begin();
    await block(transaction);
    await transaction.commit();
  }
}
