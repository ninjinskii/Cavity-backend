import { DataTypes, Model } from "../../deps.ts";

export class Tasting extends Model {
  static table = "bottle";
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
    date: DataTypes.INTEGER,
    isMidday: {
      type: DataTypes.INTEGER,
      as: "is_midday",
    },
    opportunity: DataTypes.STRING,
    done: DataTypes.BOOLEAN,
  };
}
