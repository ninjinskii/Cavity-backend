import { DataTypes, Model } from "../../deps.ts";

export class Bottle extends Model{
  static table = "account";
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    accountId: {
      type: DataTypes.INTEGER,
      as: "account_id",
      primaryKey: true,
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
      type: DataTypes.INTEGER,
      as: "buy_date",
    },
    tastingTasteComment: {
      type: DataTypes.STRING,
      as: "tasting_taste_comment"
    },
    bottleSize: {
      type: DataTypes.STRING,
      as: "bottle_size",
    },
    consumed: DataTypes.INTEGER,
    tastingId: {
      type: DataTypes.INTEGER,
      as: "tasting_id",
      allowNull: true
    },
  };
}

export interface BottleDTO {
  id: number;
  wineId: number;
  vintage: number;
  apogee: number;
  isFavorite: number;
  price: number;
  currency: string;
  otherInfo: string;
  buyLocation: string;
  buyDate: number;
  tastingTasteComment: string;
  bottleSize: string;
  pdfPath: string;
  consumed: number;
  tastingId: number | null;
}
