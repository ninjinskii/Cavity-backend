import { logger, QueryObjectResult } from "../../deps.ts";
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

  private async init() {
    try {
      await this.db.init();
    } catch (_error) {
      logger.error("Cannot connect to database");
    }
  }

  do<T>(query: string): Promise<QueryObjectResult<T>> {
    return this.db.do(query);
  }

  doInTransaction(block: () => Promise<void>): Promise<void> {
    return this.db.doInTransaction(block);
  }

  static async getInstance(): Promise<Repository> {
    new Repository();
    await instance?.init();
    return instance!;
  }
}
