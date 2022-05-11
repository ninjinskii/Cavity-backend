import { DataTypes, Model } from "../../deps.ts";

export class HistoryEntry extends Model {
  static table = "history_entry";
  static fields = {
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
