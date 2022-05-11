import { DataTypes, Model } from "../../deps.ts";

export class TastingAction extends Model {
  static table = "tasting_action";
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
    type: DataTypes.STRING,
    bottleId: {
      type: DataTypes.INTEGER,
      as: "bottle_id",
    },
    done: DataTypes.INTEGER,
  };
}
