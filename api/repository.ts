import Database from "./db.ts";

let instance: Repository | null = null;

interface InsertQueryParams {
  vars: string;
  values: string;
}

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

  private toPgsqlArgs(object: any): InsertQueryParams {
    let vars = "";
    let values = "";

    Object.keys(object).forEach((key) => vars += key + ",");
    Object.values(object).forEach((val) => values += `'${val}',`);

    // Remove trailing comma
    vars = vars.slice(0, -1);
    values = values.slice(0, -1);

    return { vars, values };
  }

  async createAllTables(): Promise<void> {
    await this.createTables("account", "county");
  }

  async createTables(...tables: Array<string>): Promise<void> {
    for (const table of tables) {
      try {
        const query = await Deno.readTextFile(`./api/sql/${table}.sql`);
        await this.db.doQuery(query);
      } catch (error) {
        console.log(error);
      }
    }
  }

  async dropTable(table: string) {
    try {
      const query = `DROP TABLE IF EXISTS ${table};`;
      await this.db.doQuery(query);
    } catch (error) {
      console.log(error);
    }
  }

  // TODO: map model object in return type
  async select<T>(table: string): Promise<{ rows: Array<T>}> {
    const query = `SELECT * FROM ${table}`;

    try {
      return await this.db.doQuery(query) as { rows: Array<T>};
    } catch (error) {
      console.warn(error);
      throw new Error(`Cannot execute select statement into ${table} table.`)
    }
  }

  async insert(table: string, object: any): Promise<void> {
    const { vars, values } = this.toPgsqlArgs(object);
    const query = `INSERT INTO ${table} (${vars}) VALUES (${values});`;

    try {
      await this.db.doQuery(query);
    } catch (error) {
      console.warn(error);
      throw new Error(`Cannot insert data into ${table} table.`);
    }
  }

  static async getInstance(): Promise<Repository> {
    new Repository();
    await instance?.connect();
    return instance!;
  }
}
