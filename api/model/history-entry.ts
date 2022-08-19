import { DataTypes, Model } from "./model.ts";

export class HistoryEntry implements Model {
  table = "history_entry";
  fields = {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id: DataTypes.INTEGER,
    accountId: {
      type: DataTypes.INTEGER,
      as: "account_id",
    },
    date: DataTypes.BIG_INTEGER,
    bottleId: {
      type: DataTypes.INTEGER,
      as: "bottle_id",
    },
    tastingId: {
      type: DataTypes.INTEGER,
      as: "tasting_id",
      allowNull: true,
    },
    comment: DataTypes.STRING,
    type: DataTypes.INTEGER,
    favorite: DataTypes.INTEGER,
  };
}
