import { camelCase, snakeCase } from "case";
import { Client } from "postgres";
import { SupabaseClient } from "supabase";

export interface RestDao<T> {
  selectByAccountId(accountId: number): Promise<T[]>;
  insert(objects: T[]): Promise<void>;
  deleteAllForAccount(accountId: number): Promise<void>;
  replaceAllForAccount(accountId: number, objects: T[]): Promise<void>;
}

export interface PostgresClientRestDaoConfig {
  client: Client;
  table: string;
  ignoredFields?: string[];
}

export class PostgresClientRestDao<T> implements RestDao<T> {
  private readonly client: Client;
  private readonly table: string;
  private readonly ignoredFields: string[];

  constructor(config: PostgresClientRestDaoConfig) {
    this.client = config.client;
    this.table = config.table;
    this.ignoredFields = config.ignoredFields || [];
  }

  async selectByAccountId(accountId: number): Promise<T[]> {
    const { rows } = await this.client.queryObject<T>({
      args: [accountId],
      camelCase: true,
      text: `SELECT * FROM ${this.table} WHERE account_id = $1;`,
    });

    return rows;
  }

  insert(objects: T[]): Promise<void> {
    const { statement, actualValues } = this.toSqlInsert(objects);
    return this.client.queryObject<T>({
      text: `INSERT INTO ${this.table} ${statement};`,
      args: actualValues,
    }) as Promise<unknown> as Promise<void>;
  }

  deleteAllForAccount(accountId: number): Promise<void> {
    return this.client.queryObject<T>({
      args: [accountId],
      text: `DELETE FROM ${this.table} WHERE account_id = $1;`,
    }) as Promise<unknown> as Promise<void>;
  }

  async replaceAllForAccount(accountId: number, objects: T[]): Promise<void> {
    const transaction = this.client.createTransaction(
      `replace_all_for_account_${accountId}_${this.table}`,
    );

    try {
      await transaction.begin();
      await transaction.queryObject({
        args: [accountId],
        text: `DELETE FROM ${this.table} WHERE account_id = $1;`,
      });

      if (objects.length > 0) {
        const { statement, actualValues } = this.toSqlInsert(objects);
        await transaction.queryObject({
          text: `INSERT INTO ${this.table} ${statement};`,
          args: actualValues,
        });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private toSnakeCase<T>(object: T): T {
    // deno-lint-ignore no-explicit-any
    const formatted: any = {};

    for (const key in object) {
      formatted[snakeCase(key)] = object[key];
    }

    return formatted;
  }

  private toSqlInsert(objects: unknown[]): { statement: string; actualValues: unknown[] } {
    const example = this.toSnakeCase(objects[0]) as object;

    // Filter out ignored fields
    const allFields = Object.keys(example);
    const filteredFields = allFields.filter((field) => !this.ignoredFields.includes(field));
    const fields = filteredFields.join(", ");

    const values: unknown[] = [];
    const preparedValuesArray: string[] = [];
    let preparedArgsCounter = 1;

    for (const object of objects) {
      const snakeCasedObject = this.toSnakeCase(object) as Record<string, unknown>;
      const objectPreparedValuesArray = [];

      // Only use filtered fields
      for (const field of filteredFields) {
        objectPreparedValuesArray.push(`$${preparedArgsCounter++}`);
        values.push(snakeCasedObject[field]);
      }

      preparedValuesArray.push(`(${objectPreparedValuesArray.join(", ")})`);
    }

    const preparedValues = preparedValuesArray.join(", ");
    return { statement: `(${fields}) VALUES ${preparedValues}`, actualValues: values };
  }
}

export class SupabaseRestDao<T> implements RestDao<T> {
  constructor(private supabaseClient: SupabaseClient, private table: string) {}

  async selectByAccountId(accountId: number): Promise<T[]> {
    const response = await this.supabaseClient
      .from(this.table)
      .select()
      .eq("account_id", accountId);

    if (response.error) {
      throw response.error;
    }

    return response.data.map((object) => this.toCamelCase(object));
  }

  async insert(objects: T[]): Promise<void> {
    const formatted = objects.map((object) => this.toSnakeCase(object));
    const response = await this.supabaseClient
      .from(this.table)
      .insert(formatted);

    if (response.error) {
      throw response.error;
    }
  }

  async deleteAllForAccount(accountId: number): Promise<void> {
    const response = await this.supabaseClient
      .from(this.table)
      .delete()
      .eq("account_id", accountId);

    if (response.error) {
      throw response.error;
    }
  }

  async replaceAllForAccount(accountId: number, objects: T[]): Promise<void> {
    // Note: Supabase doesn't support transactions in client library
    // This is best-effort only
    await this.deleteAllForAccount(accountId);
    if (objects.length > 0) {
      await this.insert(objects);
    }
  }

  private toSnakeCase<T>(object: T): T {
    // deno-lint-ignore no-explicit-any
    const formatted: any = {};

    for (const key in object) {
      formatted[snakeCase(key)] = object[key];
    }

    return formatted;
  }

  private toCamelCase<T>(object: T): T {
    // deno-lint-ignore no-explicit-any
    const formatted: any = {};

    for (const key in object) {
      formatted[camelCase(key)] = object[key];
    }

    return formatted;
  }
}
