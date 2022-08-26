import { Entity, Field, Nullable, PrimaryKey } from "../../deps.ts";

@Entity("grape")
export class Grape {
  constructor(
    @PrimaryKey("SERIAL") public _id: number,
    @Field("INT", Nullable.NO, "account_id") public accountId: number,
    @Field("INT") public id: number,
    @Field("VARCHAR") public name: string,
  ) {
  }
}
