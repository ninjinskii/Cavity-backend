import { Dao, SupabaseClient, Query, Insert, Delete, Where } from "../../deps.ts";
import { Account } from "../model/account.ts";

export interface AccountDao {
 
  selectById(id: number): Promise<Array<Pick<Account, 'email' | 'registrationCode'>>>;

  selectByEmail(email: string): Promise<Array<Pick<Account, 'id' | 'registrationCode'>>>;

  selectByEmailWithPassword(
    email: string,
  ): Promise<
    { id: number; registrationCode: number | null; password: string }[]
  >;

  register(email: string): Promise<never>;

  setPendingRecovery(email: string, token: string): Promise<never>;

  recover(password: string, token: string): Promise<never>;

  insert(
    accounts: { email: string; password: string; registrationCode: number }[],
  ): Promise<void>;

  deleteByEmail(email: string): Promise<void>;

  deleteById(id: number): Promise<void>;
}

export class SupabaseAccountDao implements AccountDao {

  constructor(private supabaseClient: SupabaseClient) {}

  async selectById(id: number): Promise<Array<Pick<Account, 'email' | 'registrationCode'>>> {
    const response = await this.supabaseClient
      .from('account')
      .select('email, registrationCode:registration_code')
      .eq('id', id); // TODO: vérifier que la conversion int -> string foncitonne bien

    return this.processSupabaseResponse(response)
  }

  async selectByEmail(email: string): Promise<Array<Pick<Account, 'id' | 'registrationCode'>>> {
    const response = await this.supabaseClient
      .from('account')
      .select('id, registrationCode:registration_code')
      .eq('email', email);

    return this.processSupabaseResponse(response)
  }

  async selectByEmailWithPassword(email: string): Promise<Array<Pick<Account, 'id' | 'registrationCode' | 'password'>>> {
    const response = await this.supabaseClient
      .from('account')
      .select('id, registrationCode:registration_code, password')
      .eq('email', email);

    return this.processSupabaseResponse(response)
  }

  async register(email: string): Promise<never> {
    const response = await this.supabaseClient
      .from('account')
      .update({ registration_code: null })
      .eq('email', email);

    return this.processSupabaseResponse(response)
  }

  async setPendingRecovery(email: string, token: string): Promise<never> {
    const response = await this.supabaseClient
      .from('account')
      .update({ reset_token: token })
      .eq('email', email);

    return this.processSupabaseResponse(response)
  }

  async recover(password: string, token: string): Promise<never> {
    const response = await this.supabaseClient
        .from('account')
        .update({ password })
        .eq('reset_token', token);

    return this.processSupabaseResponse(response);
  }

  async insert(accounts: { email: string; password: string; registrationCode: number; }[]): Promise<void> {
    const renamed = accounts.map(account => ({ 
      email: account.email,
      password: account.password,
      registration_code: account.registrationCode 
    }))

    const response = await this.supabaseClient
      .from('account')
      .insert(renamed);

    if (response.error) {
      throw response.error;
    }
  }

  async deleteByEmail(email: string): Promise<void> {
    const response = await this.supabaseClient
      .from('account')
      .delete()
      .eq('email', email);

    if (response.error) {
      throw response.error;
    }
  }

  async deleteById(id: number): Promise<void> {
    const response = await this.supabaseClient
      .from('account')
      .delete()
      .eq('id', id);

    if (response.error) {
      throw response.error;
    }
  }

  // TODO: remove this method bc it hides real type return from query thus hiding type
  private processSupabaseResponse<T>({data, error}: { data: any, error: any }): T {
    if (error || !data) {
      throw error;
    }
  
    return data;
  }
}

export class DenormAccountDao extends Dao implements AccountDao {

  @Query(
    "SELECT id, email, registration_code FROM account WHERE id = $1;",
    ["id", "email", "registrationCode"],
  )
  selectById(_id: number): Promise<Pick<Account, "email" | "registrationCode">[]> {
    throw new Error("Method not implemented.");
  }

  @Query(
    "SELECT id, registration_code FROM account WHERE email = $1;",
    ["id", "registrationCode"],
  )
  selectByEmail(_email: string): Promise<Pick<Account, "registrationCode" | "id">[]> {
    throw new Error("Method not implemented.");
  }

  @Query(
    "SELECT id, registration_code, password FROM account WHERE email = $1;",
    ["id", "registrationCode", "password"],
  )
  selectByEmailWithPassword(_email: string): Promise<{ id: number; registrationCode: number | null; password: string; }[]> {
    throw new Error("Method not implemented.");
  }

  @Query("UPDATE account SET registration_code = NULL WHERE email = $1;")
  register(_email: string): Promise<never> {
    throw new Error("Method not implemented.");
  }

  @Query("UPDATE account SET reset_token = $2 WHERE email = $1;")
  setPendingRecovery(_email: string, _token: string): Promise<never> {
    throw new Error("Method not implemented.");
  }

  @Query("UPDATE account SET password = $1, reset_token = NULL WHERE reset_token = $2;")
  recover(_password: string, _token: string): Promise<never> {
    throw new Error("Method not implemented.");
  }

  @Insert()
  insert(_accounts: { email: string; password: string; registrationCode: number; }[]): Promise<void> {
    throw new Error("Method not implemented.");
  }

  @Delete(new Where({ email: "°1" }))
  deleteByEmail(_email: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  @Delete(new Where({ id: "°1" }))
  deleteById(_id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

}