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

  async createTable(tableName: string): Promise<Array<any>> {
    try {
      const result = await this.db.doQuery(
        `CREATE TABLE IF NOT EXISTS county (
          _id serial PRIMARY KEY,
          user_id INT NOT NULL,
          id BIGINT NOT NULL,
          name VARCHAR NOT NULL,
          pref_order INT NOT NULL
        )`,
      );
      return result.rows;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async getInstance(): Promise<Repository> {
    new Repository();
    await instance?.connect();
    return instance!;
  }
}
