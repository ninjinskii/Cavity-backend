import { Entity, Field, Nullable, PrimaryKey } from "../../deps.ts";

@Entity("county")
export class County {
  constructor(
    @PrimaryKey("SERIAL") public _id: number,
    @Field("INT", Nullable.NO, "account_id") public accountId: number,
    @Field("INT") public id: number,
    @Field("VARCHAR") public name: string,
    @Field("INT", Nullable.NO, "pref_order") public prefOrder: number,
  ) {
  }
}
