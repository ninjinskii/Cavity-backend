import { DataTypes, Model } from "../../deps.ts";

export class Grape extends Model {
  static table = "grape";
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
  };
}
