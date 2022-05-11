import { DataTypes, Model } from "../../deps.ts";

export class QGrape extends Model {
  static table = "q_grape";
  static fields = {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    accountId: {
      type: DataTypes.INTEGER,
      as: "account_id",
    },
    bottleId: {
      type: DataTypes.INTEGER,
      as: "bottle_id",
    },
    grapeId: {
      type: DataTypes.INTEGER,
      as: "grape_id",
    },
    percentage: DataTypes.INTEGER,
  };
}
