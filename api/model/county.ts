import { DataTypes, Model } from "./model.ts";

export class County implements Model {
  table = "county";
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
    name: DataTypes.STRING,
    prefOrder: {
      type: DataTypes.INTEGER,
      as: "pref_order",
    },
  };
}
