import Database from "./db.ts";

let instance: Repository | null = null;

export default class Repository {
  private db!: Database;

  private constructor() {
    if (!instance) {
      this.db = new Database();
      instance = this;
    }
  }

  private async connect() {
    try {
      await this.db.connect();
    } catch (error) {
      console.error("Cannot connect to database");
    }
  }

  async createAllTables(): Promise<void> {
    await this.createTables("account", "county");
  }

  async createTables(...tables: Array<string>): Promise<void> {
    for (const table of tables) {
      try {
        const query = await Deno.readTextFile(`./sql/${table}.sql`);
        await this.db.doQuery(query);
      } catch (error) {
        console.log(error);
      }
    }
  }

  async removeTable(table: string) {
    try {
      const query = `DROP TABLE IF EXISTS ${table}`;
      await this.db.doQuery(query);
    } catch (error) {
      console.log(error);
    }
  }

  static async getInstance(): Promise<Repository> {
    new Repository();
    await instance?.connect();
    return instance!;
  }
}
