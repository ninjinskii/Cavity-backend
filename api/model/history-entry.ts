import { Entity, Field, Nullable, PrimaryKey } from "../../deps.ts";

@Entity("history_entry")
export class HistoryEntry {
  constructor(
    @PrimaryKey("SERIAL") public _id: number,
    @Field("INT", Nullable.NO, "account_id") public accountId: number,
    @Field("INT") public id: number,
    @Field("BIGINT") public date: number,
    @Field("INT", Nullable.NO, "bottle_id") public bottleId: number,
    @Field("INT", Nullable.YES, "tasting_id") public tastingId: number | null,
    @Field("VARCHAR") public comment: string,
    @Field("INT") public type: number,
    @Field("INT") public favorite: number,
  ) {
  }
}
