import { Client, Dao, Delete, Insert, Select, SupabaseClient, Where } from "../../deps.ts";

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

    if (response.error || !response.data) {
      throw response.error
    }

    return response.data
  }

  async insert(objects: T[]): Promise<void> {
    const response = await this.supabaseClient
      .from(this.table)
      .insert(objects);

    if (response.error || !response.data) {
      throw response.error
    }
  }

  async deleteAllForAccount(accountId: number): Promise<void> {
    const response = await this.supabaseClient
      .from(this.table)
      .delete()
      .eq('account_id', accountId)

    if (response.error || !response.data) {
      throw response.error
    }
  }
}

export class DenormRestDao<T> extends Dao implements RestDao<T> {
  constructor(postgresClient: Client, table: string) {
    super(postgresClient, table)
  }

  @Select(new Where({ account_id: "°1" }))
  selectByAccountId(_accountId: number): Promise<T[]> {
    throw new Error('');
  }

  @Insert()
  insert(_objects: T[]): Promise<void> {
    throw new Error('');
  }

  @Delete(new Where({ account_id: "°1" }))
  deleteAllForAccount(_accountId: number): Promise<void> {
    throw new Error('');
  }  
}
