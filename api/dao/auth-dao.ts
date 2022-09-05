import { Dao, Delete, Insert, Query, Where } from "../../deps.ts";
import { Account } from "../model/account.ts";

export class AuthDao extends Dao {
  @Query(
    "SELECT id, email, registration_code AS registrationCode FROM account WHERE id = $1;",
  )
  selectById(_id: number): Promise<Account[]> {
    throw new Error();
  }

  @Query(
    "SELECT id, registration_code AS registrationCode FROM account WHERE email = $1;",
  )
  selectByEmail(_email: string): Promise<Account[]> {
    throw new Error();
  }

  @Query("UPDATE account SET registration_code = null WHERE email = $1;")
  register(_email: string): Promise<never> {
    throw new Error();
  }

  @Query("UPDATE account SET reset_token = $2 WHERE email = $1;")
  setPendingRecovery(_email: string, _token: string): Promise<never> {
    throw new Error();
  }

  @Query("UPDATE account SET password = $1 WHERE reset_token = $2;")
  recover(_password: string, _token: string): Promise<never> {
    throw new Error();
  }

  @Insert()
  insert(
    _accounts: { email: string; password: string; registrationCode: number }[],
  ): Promise<number> {
    throw new Error();
  }

  @Delete(new Where({ email: "°1" }))
  deleteByEmail(_email: string): Promise<number> {
    throw new Error();
  }

  @Delete(new Where({ id: "°1" }))
  deleteById(_id: number): Promise<number> {
    throw new Error();
  }
}
