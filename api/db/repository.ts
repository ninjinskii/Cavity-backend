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

    const noIdValues = Object.values(object);
    const noIdKeys = Object.keys(object);
    noIdValues.shift();
    noIdKeys.shift();

    noIdKeys.forEach((key) => vars += key + ",");
    noIdValues.forEach((val) => values += `'${val}',`);

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
        const query = await Deno.readTextFile(`./api/db/sql/${table}.sql`);
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

  async select<T>(table: string): Promise<Array<T>> {
    const query = `SELECT * FROM ${table};`;

    try {
      const result = await this.db.doQuery(query);
      return result.rows as Array<T>;
    } catch (error) {
      console.warn(error);
      throw new Error(`Cannot execute select statement into ${table} table.`);
    }
  }

  async selectBy<T>(
    table: string,
    by: string,
    value: string,
  ): Promise<Array<T>> {
    const query = `SELECT * FROM ${table} WHERE ${by} = '${value}';`;

    try {
      const result = await this.db.doQuery(query);
      return result.rows as Array<T>;
    } catch (error) {
      console.warn(error);
      throw new Error(
        `Cannot execute select statement into ${table} table where ${by} = ${value}.`,
      );
    }
  }

  async insert(table: string, objects: Array<any> | any): Promise<void> {
    if (!objects.length) {
      return;
    }

    const unboxed = objects instanceof Array ? objects : [objects]
    const { vars } = this.toPgsqlArgs(objects[0]);
    let query = `INSERT INTO ${table} (${vars}) VALUES`;

    for (const object of unboxed) {
      const { values } = this.toPgsqlArgs(object);
      query += ` (${values}),`;
    }

    query = query.slice(0, -1);
    query += ";";

    console.log("query");
    console.log(query);

    try {
      await this.db.doQuery(query);
    } catch (error) {
      console.warn(error);
      throw new Error(`Cannot insert data into ${table} table.`);
    }
  }

  async update(
    table: string,
    field: string,
    value: string | null,
    where?: { filter: string; value: string },
  ): Promise<void> {
    const quotedValue = value ? `'${value}'` : null;
    const query = where
      ? `UPDATE ${table} SET ${field} = ${quotedValue} WHERE ${where.filter} = '${where.value}'`
      : `UPDATE ${table} SET ${field} = ${quotedValue}`;

    try {
      await this.db.doQuery(query);
    } catch (error) {
      console.warn(error);
      throw new Error(`Cannot update ${table} table.`);
    }
  }

  async deleteBy(table: string, by: string, value: string): Promise<void> {
    const query = `DELETE FROM ${table} WHERE ${by} = '${value}';`;

    try {
      await this.db.doQuery(query);
    } catch (error) {
      console.warn(error);
      throw new Error(
        `Cannot delete into ${table} table where ${by} = ${value}.`,
      );
    }
  }

  doInTransaction(name: string, block: () => void): Promise<void> {
    return this.db.doInTransaction(name, block);
  }

  static async getInstance(): Promise<Repository> {
    new Repository();
    await instance?.connect();
    return instance!;
  }
}
