import { DataTypes, Model } from "../../deps.ts";

export class BottlePdf extends Model {
  static table = "bottle_pdf";
  static fields = {
    id: {
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
    content: DataTypes.TEXT,
    extension: DataTypes.STRING,
  };
}
