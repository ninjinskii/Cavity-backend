import { DataTypes, Model } from "./model.ts";

export class HistoryXFriend implements Model {
  table = "history_x_friend";
  fields = {
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
