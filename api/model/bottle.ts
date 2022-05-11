import { DataTypes, Model } from "../../deps.ts";

export class Bottle extends Model {
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
    wineId: {
      type: DataTypes.INTEGER,
      as: "wine_id",
    },
    vintage: DataTypes.INTEGER,
    apogee: DataTypes.INTEGER,
    isFavorite: {
      type: DataTypes.INTEGER,
      as: "is_favorite",
    },
    price: DataTypes.INTEGER,
    currency: DataTypes.STRING,
    otherInfo: {
      type: DataTypes.STRING,
      as: "other_info",
    },
    buyLocation: {
      type: DataTypes.STRING,
      as: "buy_location",
    },
    buyDate: {
      type: DataTypes.BIG_INTEGER,
      as: "buy_date",
    },
    tastingTasteComment: {
      type: DataTypes.STRING,
      as: "tasting_taste_comment",
    },
    bottleSize: {
      type: DataTypes.STRING,
      as: "bottle_size",
    },
    consumed: DataTypes.INTEGER,
    tastingId: {
      type: DataTypes.INTEGER,
      as: "tasting_id",
      allowNull: true,
    },
    isSelected: {
      type: DataTypes.BOOLEAN,
      as: "is_selected",
    },
    pdfPath: {
      type: DataTypes.STRING,
      as: "pdf_path",
    },
  };

  static defaults = {
    pdfPath: "",
    isSelected: 0,
  };
}
