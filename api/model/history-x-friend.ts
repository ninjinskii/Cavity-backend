import { DataTypes, Model } from "../../deps.ts";

export class HistoryXFriend extends Model {
  static table = "history_x_friend";
  static fields = {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    accountId: {
      type: DataTypes.INTEGER,
      as: "account_id",
    },
    historyEntryId: {
      type: DataTypes.INTEGER,
      as: "history_entry_id",
    },
    friendId: {
      type: DataTypes.INTEGER,
      as: "friend_id",
    },
  };
}
