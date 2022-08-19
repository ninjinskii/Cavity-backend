import { DataTypes, Model } from "./model.ts";

export class TastingAction implements Model {
  table = "tasting_action";
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
    type: DataTypes.STRING,
    bottleId: {
      type: DataTypes.INTEGER,
      as: "bottle_id",
    },
    done: DataTypes.INTEGER,
  };
}
