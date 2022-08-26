import { Entity, Field, Nullable, PrimaryKey } from "../../deps.ts";

@Entity("q_grape")
export class QGrape {
  constructor(
    @PrimaryKey("SERIAL") public _id: number,
    @Field("INT", Nullable.NO, "account_id") public accountId: number,
    @Field("INT", Nullable.NO, "bottle_id") public bottleId: number,
    @Field("INT", Nullable.NO, "grape_id") public grapeId: number,
    @Field("INT") public percentage: number,
  ) {
  }
}
