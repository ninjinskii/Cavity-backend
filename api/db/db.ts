import { logger, PostgresClient, QueryObjectResult, Transaction } from "../../deps.ts";

export default class Database {
  private client: PostgresClient;
  private transaction: Transaction | null = null;
  private DATABASE_URL = Deno.env.get("DATABASE_URL");

  constructor() {
    if (!this.DATABASE_URL) {
      throw Error(
        "Cannot connect to database, do you have set up DATABASE_URL env var ?",
      );
    }

    this.client = new PostgresClient(this.DATABASE_URL);

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
    await this.client.connect();
    await this.createTables();
  }

  close(): Promise<void> {
    return this.client.end();
  }

  do<T>(query: string): Promise<QueryObjectResult<T>> {
    return this.client.queryObject(query);
  }

  async doInTransaction(block: () => Promise<void>): Promise<void> {
    this.transaction = this.client.createTransaction("transaction");
    await this.transaction.begin();

    try {
      await block();
      await this.transaction.commit();
    } finally {
      this.transaction = null;
    }
  }

  private async createTables(): Promise<void> {
    for await (const entry of Deno.readDir("./api/db/sql")) {
      if (entry.isFile) {
        try {
          const query = await Deno.readTextFile(`./api/db/sql/${entry.name}`);
          await this.client.queryObject(query);
        } catch (error) {
          logger.error(error);
        }
      }
    }
  }
}
