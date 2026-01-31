import { Client } from "postgres";
import { SupabaseClient } from "supabase";
import { snakeCase } from "case";
import { Account } from "../model/account.ts";

type AccountWithEmail = Pick<Account, "email" | "registrationCode" | "lastUser" | "lastUpdateTime">;
type AccountWithId = Pick<Account, "id" | "registrationCode" | "lastUser" | "lastUpdateTime">;
type AccountWithPassword = Pick<
  Account,
  "id" | "registrationCode" | "password" | "lastUser" | "lastUpdateTime"
>;

export interface AccountDao {
  selectById(
    id: number,
  ): Promise<
    Pick<
      Account,
      "email" | "registrationCode" | "lastUser" | "lastUpdateTime"
    >[]
  >;

  selectByEmail(
    email: string,
  ): Promise<
    Pick<Account, "id" | "registrationCode" | "lastUser" | "lastUpdateTime">[]
  >;

  selectByEmailWithPassword(
    email: string,
  ): Promise<
    Pick<
      Account,
      "id" | "registrationCode" | "password" | "lastUser" | "lastUpdateTime"
    >[]
  >;

  register(email: string): Promise<never>;

  setPendingRecovery(email: string, token: string): Promise<never>;

  recover(password: string, token: string): Promise<never>;

  insert(
    accounts: { email: string; password: string; registrationCode: number }[],
  ): Promise<void>;

  updateLastUser(
    accountId: number,
    lastUser: string,
    lastUpdateTime: number,
  ): Promise<void>;

  deleteByEmail(email: string): Promise<void>;

  deleteById(id: number): Promise<void>;
}

export class PostgresClientAccountDao implements AccountDao {
  private readonly table = "account";

  constructor(private client: Client) {}

  async selectById(id: number): Promise<AccountWithEmail[]> {
    const fields = ["email", "registration_code", "last_user", "last_update_time"];
    const { rows } = await this.client.queryObject<AccountWithEmail>({
      args: [id],
      camelCase: true,
      text: `SELECT ${fields.join(", ")} FROM ${this.table} WHERE id = $1;`,
    });

    return rows;
  }

  async selectByEmail(email: string): Promise<AccountWithId[]> {
    const fields = ["id", "registration_code", "last_user", "last_update_time"];
    const { rows } = await this.client.queryObject<AccountWithId>({
      args: [email],
      camelCase: true,
      text: `SELECT ${fields.join(", ")} FROM ${this.table} WHERE email = $1;`,
    });

    return rows;
  }

  async selectByEmailWithPassword(email: string): Promise<AccountWithPassword[]> {
    const fields = ["id", "registration_code", "password", "last_user", "last_update_time"];
    const { rows } = await this.client.queryObject<AccountWithPassword>({
      args: [email],
      camelCase: true,
      text: `SELECT ${fields.join(", ")} FROM ${this.table} WHERE email = $1;`,
    });

    return rows;
  }

  register(email: string): Promise<never> {
    const column = "registration_code";
    return this.client.queryObject({
      args: [email],
      camelCase: true,
      text: `UPDATE ${this.table} SET ${column} = NULL WHERE email = $1;`,
    }) as Promise<never>;
  }

  setPendingRecovery(email: string, token: string): Promise<never> {
    const column = "reset_token";
    return this.client.queryObject({
      args: [token, email],
      camelCase: true,
      text: `UPDATE ${this.table} SET ${column} = $1 WHERE email = $2;`,
    }) as Promise<never>;
  }

  recover(password: string, token: string): Promise<never> {
    const column1 = "password";
    const column2 = "reset_token";

    return this.client.queryObject({
      args: [password, token],
      camelCase: true,
      text: `UPDATE ${this.table} SET ${column1} = $1, ${column2} = $2 WHERE ${column2} = $2;`,
    }) as Promise<never>;
  }

  insert(
    accounts: { email: string; password: string; registrationCode: number }[],
  ): Promise<void> {
    const { statement, actualValues } = this.toSqlInsert(accounts);
    return this.client.queryObject({
      text: `INSERT INTO ${this.table} ${statement};`,
      args: actualValues,
    }) as Promise<never>;
  }

  updateLastUser(
    accountId: number,
    lastUser: string,
    lastUpdateTime: number,
  ): Promise<void> {
    const column1 = "last_user";
    const column2 = "last_update_time";

    return this.client.queryObject({
      args: [lastUser, lastUpdateTime, accountId],
      text: `UPDATE ${this.table} SET ${column1} = $1, ${column2} = $2 WHERE id = $3;`,
    }) as Promise<never>;
  }

  deleteByEmail(email: string): Promise<void> {
    return this.client.queryObject({
      args: [email],
      text: `DELETE FROM ${this.table} WHERE email = $1;`,
    }) as Promise<never>;
  }

  deleteById(accountId: number): Promise<void> {
    return this.client.queryObject({
      args: [accountId],
      text: `DELETE FROM ${this.table} WHERE id = $1;`,
    }) as Promise<never>;
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
    const fields = Object.keys(example).join(", ");

    const values: any[] = [];
    const preparedValuesArray: any[] = [];
    let preparedArgsCounter = 1;

    for (const object of objects) {
      const snakeCasedObject = this.toSnakeCase(object) as object;
      const objectPreparedValuesArray = [];

      for (const value of Object.values(snakeCasedObject)) {
        objectPreparedValuesArray.push(`$${preparedArgsCounter++}`);
        values.push(value);
      }

      preparedValuesArray.push(`(${objectPreparedValuesArray.join(", ")})`);
    }

    const preparedValues = preparedValuesArray.join(", ");
    return { statement: `(${fields}) VALUES ${preparedValues}`, actualValues: values };
  }
}

export class SupabaseAccountDao implements AccountDao {
  constructor(private supabaseClient: SupabaseClient) {}

  async selectById(
    id: number,
  ): Promise<
    Pick<
      Account,
      "email" | "registrationCode" | "lastUser" | "lastUpdateTime"
    >[]
  > {
    const response = await this.supabaseClient
      .from("account")
      .select(
        "email, registrationCode:registration_code, lastUser:last_user, lastUpdateTime:last_update_time",
      )
      .eq("id", id);

    return this.processSupabaseResponse(response);
  }

  async selectByEmail(
    email: string,
  ): Promise<
    Pick<Account, "id" | "registrationCode" | "lastUser" | "lastUpdateTime">[]
  > {
    const response = await this.supabaseClient
      .from("account")
      .select("id, registrationCode:registration_code")
      .eq("email", email);

    return this.processSupabaseResponse(response);
  }

  async selectByEmailWithPassword(
    email: string,
  ): Promise<
    Pick<
      Account,
      "id" | "registrationCode" | "password" | "lastUser" | "lastUpdateTime"
    >[]
  > {
    const response = await this.supabaseClient
      .from("account")
      .select(
        "id, registrationCode:registration_code, password, lastUser:last_user, lastUpdateTime:last_update_time",
      )
      .eq("email", email);

    return this.processSupabaseResponse(response);
  }

  async register(email: string): Promise<never> {
    const response = await this.supabaseClient
      .from("account")
      .update({ registration_code: null })
      .eq("email", email);

    return this.processSupabaseResponse(response);
  }

  async setPendingRecovery(email: string, token: string): Promise<never> {
    const response = await this.supabaseClient
      .from("account")
      .update({ reset_token: token })
      .eq("email", email);

    return this.processSupabaseResponse(response);
  }

  async recover(password: string, token: string): Promise<never> {
    const response = await this.supabaseClient
      .from("account")
      .update({ password, reset_token: null })
      .eq("reset_token", token);

    return this.processSupabaseResponse(response);
  }

  async insert(
    accounts: { email: string; password: string; registrationCode: number }[],
  ): Promise<void> {
    const renamed = accounts.map((account) => ({
      email: account.email,
      password: account.password,
      registration_code: account.registrationCode,
    }));

    const response = await this.supabaseClient
      .from("account")
      .insert(renamed);

    if (response.error) {
      throw response.error;
    }
  }

  async updateLastUser(
    accountId: number,
    lastUser: string,
    lastUpdateTime: number,
  ): Promise<void> {
    const response = await this.supabaseClient
      .from("account")
      .update({ last_user: lastUser, last_update_time: lastUpdateTime })
      .eq("id", accountId);

    return this.processSupabaseResponse(response);
  }

  async deleteByEmail(email: string): Promise<void> {
    const response = await this.supabaseClient
      .from("account")
      .delete()
      .eq("email", email);

    if (response.error) {
      throw response.error;
    }
  }

  async deleteById(id: number): Promise<void> {
    const response = await this.supabaseClient
      .from("account")
      .delete()
      .eq("id", id);

    if (response.error) {
      throw response.error;
    }
  }

  // TODO: remove this method bc it hides real type return from query thus hiding type
  private processSupabaseResponse<T>(
    { data, error }: { data: any; error: any },
  ): T {
    if (error) {
      throw error;
    }

    return data;
  }
}
