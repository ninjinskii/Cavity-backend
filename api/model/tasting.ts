import { Entity, Field, Nullable, PrimaryKey } from "../../deps.ts";

@Entity("tasting")
export class Tasting {
  constructor(
    @PrimaryKey("SERIAL") public _id: number,
    @Field("INT", Nullable.NO, "account_id") public accountId: number,
    @Field("INT") public id: number,
    @Field("BIGINT") public date: number,
    @Field("BOOL", Nullable.NO, "is_midday") public isMidday: boolean,
    @Field("VARCHAR") public opportunity: string,
    @Field("BOOL") public done: boolean,
  ) {
  }
}
