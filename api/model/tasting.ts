import { DataTypes, Model } from "../../deps.ts";

export class Tasting extends Model {
  static table = "tasting";
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
    date: DataTypes.BIG_INTEGER,
    isMidday: {
      type: DataTypes.BOOLEAN,
      as: "is_midday",
    },
    opportunity: DataTypes.STRING,
    done: DataTypes.BOOLEAN,
  };
}
