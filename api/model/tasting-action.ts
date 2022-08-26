import { Entity, Field, Nullable, PrimaryKey } from "../../deps.ts";

@Entity("tasting_action")
export class TastingAction {
  constructor(
    @PrimaryKey("SERIAL") public _id: number,
    @Field("INT", Nullable.NO, "account_id") public accountId: number,
    @Field("INT") public id: number,
    @Field("INT") public type: number,
    @Field("INT", Nullable.NO, "bottle_id") public bottleId: number,
    @Field("INT") public done: number,
  ) {
  }
}
