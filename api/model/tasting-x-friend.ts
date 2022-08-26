import { Entity, Field, Nullable, PrimaryKey } from "../../deps.ts";

@Entity("tasting_x_friend")
export class TastingXFriend {
  constructor(
    @PrimaryKey("SERIAL") public _id: number,
    @Field("INT", Nullable.NO, "account_id") public accountId: number,
    @Field("INT", Nullable.NO, "tasting_id") public tastingId: number,
    @Field("INT", Nullable.NO, "tasting_id") public friendId: number,
  ) {
  }
}
