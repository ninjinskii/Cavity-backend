import { SupabaseClient } from "../../deps.ts";
import { Account } from "../model/account.ts";

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
  ): Promise<Pick<Account, "id" | "registrationCode" | "lastUser" | "lastUpdateTime">[]>;

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
  ): Promise<Pick<Account, "id" | "registrationCode"| "lastUser" | "lastUpdateTime">[]> {
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
