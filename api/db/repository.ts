import { logger, QueryObjectResult, Transaction } from "../../deps.ts";
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

  do<T>(query: string, t?: Transaction): Promise<QueryObjectResult<T>> {
    return this.db.do(this.patchQuery(query), t);
  }

  doInTransaction(block: (t: Transaction) => Promise<void>): Promise<void> {
    return this.db.doInTransaction(block);
  }

  static async getInstance(): Promise<Repository> {
    new Repository();
    await instance?.init();
    return instance!;
  }

  // The query builder is giving invalid syntax for postgres. We need to fix it
  // by doing some magical moves
  private patchQuery(query: string): string {
    let step = query
      .replaceAll('"', "'") // These quotes are not valid for fields
      .replaceAll("`", '"') // These quote are not valid for values
      .replaceAll(") (", "),("); // Missing comma between INSERT VALUES parentheses
    step += ";";

    return step;
  }
}
