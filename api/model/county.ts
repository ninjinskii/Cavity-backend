import { DataTypes, Model } from "../../deps.ts";

export class County extends Model {
  static table = "county";
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
    name: DataTypes.STRING,
    prefOrder: {
      type: DataTypes.INTEGER,
      as: "pref_order",
    },
  };
}
