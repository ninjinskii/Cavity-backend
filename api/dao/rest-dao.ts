import { SupabaseClient, snakeCase , camelCase } from "../../deps.ts";

export interface RestDao<T> {
  selectByAccountId(accountId: number): Promise<T[]>;
  insert(objects: T[]): Promise<void>;
  deleteAllForAccount(accountId: number): Promise<void>;
}

export class SupabaseRestDao<T> implements RestDao<T> {
  constructor(private supabaseClient: SupabaseClient, private table: string) {}

  async selectByAccountId(accountId: number): Promise<T[]> {
    const response = await this.supabaseClient
      .from(this.table)
      .select()
      .eq('account_id', accountId);

    if (response.error) {
      throw response.error
    }

    return response.data.map(object => this.toCamelCase(object))
  }

  async insert(objects: T[]): Promise<void> {
    const formatted = objects.map(object => this.toSnakeCase(object))
    const response = await this.supabaseClient
      .from(this.table)
      .insert(formatted);

    if (response.error) {
      throw response.error
    }
  }

  async deleteAllForAccount(accountId: number): Promise<void> {
    const response = await this.supabaseClient
      .from(this.table)
      .delete()
      .eq('account_id', accountId)

    if (response.error) {
      throw response.error
    }
  }

  private toSnakeCase<T>(object: T): T {
    // deno-lint-ignore no-explicit-any
    const formatted: any = {}

    for (const key in object) {
      formatted[snakeCase(key)] = object[key]
    }

    return formatted
  }

  private toCamelCase<T>(object: T): T {
    // deno-lint-ignore no-explicit-any
    const formatted: any = {}

    for (const key in object) {
      formatted[camelCase(key)] = object[key]
    }

    return formatted
  }
}
