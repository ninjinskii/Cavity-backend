import { DataTypes, Model } from "../../deps.ts";

export class WineImage extends Model {
  static table = "wine_image";
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
    wineId: {
      type: DataTypes.INTEGER,
      as: "wine_id",
    },
    content: DataTypes.TEXT,
    extension: DataTypes.STRING,
  };
}
