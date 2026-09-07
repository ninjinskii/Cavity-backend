import * as logger from "@std/log";
import { Client } from "postgres";
import { SupabaseClient } from "supabase";
import { filterIgnoredFields, toCamelCase, toSnakeCase } from "../util/transform-data.ts";

export interface RestDaoConfig {
  client: Client | SupabaseClient;
  table: string;
  ignoredFields?: string[];
}

export interface RestDao<T> {
  selectByAccountId(accountId: number): Promise<T[]>;
  insert(objects: T[]): Promise<void>;
  deleteAllForAccount(accountId: number): Promise<void>;
  replaceAllForAccount(accountId: number, objects: T[]): Promise<void>;
}

export function createRestDao<T>(config: RestDaoConfig): RestDao<T> {
  if (config.client instanceof Client) {
    return new PostgresClientRestDao<T>({
      client: config.client,
      table: config.table,
      ignoredFields: config.ignoredFields,
    });
  } else {
    return new SupabaseRestDao<T>({
      supabaseClient: config.client as SupabaseClient,
      table: config.table,
      ignoredFields: config.ignoredFields,
    });
  }
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
      try {
        await transaction.rollback();
      } catch (error) {
        logger.warn("Fail to rollback transaction with error:");
        logger.error(error);
      }
      throw error;
    }
  }

  private toSqlInsert(objects: unknown[]): { statement: string; actualValues: unknown[] } {
    const example = toSnakeCase(objects[0]) as object;

    // Filter out ignored fields
    const allFields = Object.keys(example);
    const filteredFields = allFields.filter((field) => !this.ignoredFields.includes(field));
    const fields = filteredFields.join(", ");

    const values: unknown[] = [];
    const preparedValuesArray: string[] = [];
    let preparedArgsCounter = 1;

    for (const object of objects) {
      const snakeCasedObject = toSnakeCase(object) as Record<string, unknown>;
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

export interface SupabaseRestDaoConfig {
  supabaseClient: SupabaseClient;
  table: string;
  ignoredFields?: string[];
}

export class SupabaseRestDao<T> implements RestDao<T> {
  private readonly supabaseClient: SupabaseClient;
  private readonly table: string;
  private readonly ignoredFields: string[];

  constructor(config: SupabaseRestDaoConfig) {
    this.supabaseClient = config.supabaseClient;
    this.table = config.table;
    this.ignoredFields = config.ignoredFields || [];
  }

  async selectByAccountId(accountId: number): Promise<T[]> {
    const response = await this.supabaseClient
      .from(this.table)
      .select()
      .eq("account_id", accountId);

    if (response.error) {
      throw response.error;
    }

    return response.data.map((object) => toCamelCase(object));
  }

  async insert(objects: T[]): Promise<void> {
    const formatted = objects.map((object) =>
      filterIgnoredFields(toSnakeCase(object), this.ignoredFields)
    );
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
}
