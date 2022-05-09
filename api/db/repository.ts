import { Transaction } from "../../deps.ts";
import Database from "./db.ts";

let instance: Repository | null = null;

interface InsertQueryParams {
  vars: string;
  values: string;
}

interface QueryCondition {
  where: string;
  equals: string;
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

    const noIdValues = Object.values(object).map((value) => {
      if (typeof value === "string") {
        return (value as string)?.replaceAll("'", "''");
      } else {
        return value;
      }
    });
    const noIdKeys = Object.keys(object);
    noIdValues.shift();
    noIdKeys.shift();

    noIdKeys.forEach((key) => vars += key + ",");
    noIdValues.forEach((val) =>
      val !== undefined ? values += `'${val}',` : values += `NULL,`
    );

    // Remove trailing comma
    vars = vars.slice(0, -1);
    values = values.slice(0, -1);

    return { vars, values };
  }

  private prepareInsert(table: string, objects: Array<any>) {
    const args = [];
    const noIdKeys = Object.keys(objects[0]);
    noIdKeys.shift();

    let vars = "";
    noIdKeys.forEach((key) => vars += key + ",");
    let query = `INSERT INTO ${table} (${vars}) VALUES `;

    for (const object of objects) {
      let preparedArgs = "";

      for (const [index, _] of Object.entries(object)) {
        preparedArgs += "$" + index + ",";
      }

      // Remove trailing comma
      preparedArgs.slice(0, -1);

      query += `(${preparedArgs})`;
      args.push(Object.values(object));
    }

    console.log(query);
    console.log(args);
  }

  private buildQueryConditions(
    query: string,
    conditions: Array<QueryCondition>,
  ): string {
    if (conditions.length === 0) {
      return `${query};`;
    }

    let result = query;
    result += " WHERE ";

    for (const [index, condition] of conditions.entries()) {
      const field = condition.where;
      const value = condition.equals;
      result += `${field} = '${value}'`;

      if (index !== conditions.length - 1) {
        result += " AND ";
      }
    }

    result += ";";
    return result;
  }

  createAllTables(): Promise<void> {
    return this.createTables("account", "county");
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

  async select<T>(
    table: string,
    conditions: Array<QueryCondition> = [],
  ): Promise<Array<T>> {
    const query = `SELECT * FROM ${table}`;
    const fullQuery = this.buildQueryConditions(query, conditions);

    try {
      const result = await this.db.doQuery(fullQuery);
      return result.rows as Array<T>;
    } catch (error) {
      console.warn(error);
      throw new Error(
        `Cannot execute select statement into ${table} table.`,
      );
    }
  }

  async insert(
    table: string,
    objects: Array<any>,
    t: Transaction | null = null,
  ): Promise<void> {
    if (!objects.length) {
      return;
    }

    const args = [];
    const noIdKeys = Object.keys(objects[0]);
    noIdKeys.shift();
    let vars = "";
    noIdKeys.forEach((key) => vars += key + ",");

    // Remove trailing comma
    vars = vars.slice(0, -1);

    let query = `INSERT INTO ${table} (${vars}) VALUES `;
    let index = 1;

    for (const object of objects) {
      let preparedArgs = "";

      for (let i = 1; i <= noIdKeys.length; i++) {
        preparedArgs += "$" + index++ + ",";
      }

      // Remove trailing comma
      preparedArgs = preparedArgs.slice(0, -1);

      query += `(${preparedArgs}),`;
      args.push(
        ...Object.values(object).filter((value) => value !== undefined),
      );
    }

    // Remove trailing comma
    query = query.slice(0, -1);
    query += ";";

    try {
      await this.db.doPreparedQuery(query, args, t);
    } catch (error) {
      console.warn(error);
      throw new Error(`Cannot insert data into ${table} table.`);
    }
  }

  async update(
    table: string,
    field: string,
    value: string | null,
    conditions: Array<QueryCondition>,
  ): Promise<void> {
    const quotedValue = value ? `'${value}'` : null;
    const query = `UPDATE ${table} SET ${field} = ${quotedValue}`;
    const fullQuery = this.buildQueryConditions(query, conditions);

    try {
      await this.db.doQuery(fullQuery);
    } catch (error) {
      console.warn(error);
      throw new Error(`Cannot update ${table} table.`);
    }
  }

  async delete(
    table: string,
    conditions: Array<QueryCondition>,
    t: Transaction | null = null,
  ): Promise<void> {
    if (conditions.length === 0) {
      throw new Error(
        "Cannot run a delete command without at least 1 condition",
      );
    }

    const query = `DELETE FROM ${table}`;
    const fullQuery = this.buildQueryConditions(query, conditions);

    try {
      await this.db.doQuery(fullQuery, t);
    } catch (error) {
      console.log(fullQuery);
      console.warn(error);
      throw new Error(`Cannot delete into ${table} table.`);
    }
  }

  doInTransaction(
    name: string,
    block: (t: Transaction) => Promise<void>,
  ): Promise<void> {
    return this.db.doInTransaction(name, block);
  }

  static async getInstance(): Promise<Repository> {
    new Repository();
    await instance?.connect();
    return instance!;
  }
}
