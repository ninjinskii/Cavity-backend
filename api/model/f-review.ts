import { Entity, Field, Nullable, PrimaryKey } from "../../deps.ts";

@Entity("f_review")
export class FReview {
  constructor(
    @PrimaryKey("SERIAL") public _id: number,
    @Field("INT", Nullable.NO, "account_id") public accountId: number,
    @Field("INT", Nullable.NO, "bottle_id") public bottleId: number,
    @Field("INT", Nullable.NO, "review_id") public reviewId: number,
    @Field("INT") public value: number,
  ) {
  }
}
