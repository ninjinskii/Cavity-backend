import { Dao, Delete, Insert, Select, Where } from "../../deps.ts";

interface RestDao<T> {
  selectByAccountId(accountId: number): Promise<T[]>;
  insert(objects: T[]): Promise<number>;
  deleteAllForAccount(accountId: number): Promise<number>;
}

export class DataDao<T> extends Dao implements RestDao<T> {
  @Select(new Where({ account_id: "°1" }))
  selectByAccountId(_accountId: number): Promise<T[]> {
    throw new Error();
  }

  @Insert()
  insert(_objects: T[]): Promise<number> {
    throw new Error();
  }

  @Delete(new Where({ account_id: "°1" }))
  deleteAllForAccount(_accountId: number): Promise<number> {
    throw new Error();
  }
}
