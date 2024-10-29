import { camelCase, Client, snakeCase, SupabaseClient } from "../../deps.ts";

export interface RestDao<T> {
  selectByAccountId(accountId: number): Promise<T[]>;
  insert(objects: T[]): Promise<void>;
  deleteAllForAccount(accountId: number): Promise<void>;
}

export class PostgresClientRestDao<T> implements RestDao<T> {
  constructor(private client: Client, private table: string) {}

  async selectByAccountId(accountId: number): Promise<T[]> {
    const { rows } = await this.client.queryObject<T>({
      args: [accountId],
      camelCase: true,
      text: `SELECT * FROM ${this.table} WHERE account_id = $1;`,
    });

    return rows;
  }

  insert(objects: T[]): Promise<void> {
    return this.client.queryObject<T>({
      text: `INSERT INTO ${this.table} ${this.toSqlInsert(objects)};`,
    }) as Promise<unknown> as Promise<void>;
  }

  deleteAllForAccount(accountId: number): Promise<void> {
    return this.client.queryObject<T>({
      args: [accountId],
      text: `DELETE FROM ${this.table} WHERE account_id = $1;`,
    }) as Promise<unknown> as Promise<void>;
  }

  private toSnakeCase<T>(object: T): T {
    // deno-lint-ignore no-explicit-any
    const formatted: any = {};

    for (const key in object) {
      formatted[snakeCase(key)] = object[key];
    }

    return formatted;
  }

  public toSqlInsert(objects: unknown[]): string {
    const example = this.toSnakeCase(objects[0]) as object;
    const fields = Object.keys(example).join(", ");
    const values = objects.map((object) =>
      Object.values(object as object).join(", ")
    ).join("), (");

    return `(${fields}) VALUES (${values})`;
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
