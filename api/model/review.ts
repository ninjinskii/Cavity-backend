import { Entity, Field, Nullable, PrimaryKey } from "../../deps.ts";

@Entity("review")
export class Review {
  constructor(
    @PrimaryKey("SERIAL") public _id: number,
    @Field("INT", Nullable.NO, "account_id") public accountId: number,
    @Field("INT") public id: number,
    @Field("VARCHAR", Nullable.NO, "contest_name") public contestName: string,
    @Field("VARCHAR") public type: number,
  ) {
  }
}
