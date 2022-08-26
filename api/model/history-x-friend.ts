import { Entity, Field, Nullable, PrimaryKey } from "../../deps.ts";

@Entity("history_x_friend")
export class HistoryXFriend {
  constructor(
    @PrimaryKey("SERIAL") public _id: number,
    @Field("INT", Nullable.NO, "account_id") public accountId: number,
    @Field("INT", Nullable.NO, "history_entry_id") public historyEntryId:
      number,
    @Field("INT", Nullable.NO, "friend_id") public friendId: number,
  ) {}
}
