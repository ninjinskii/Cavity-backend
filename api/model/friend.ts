import { DataTypes, Model } from "../../deps.ts";

export class Friend extends Model {
  static table = "friend";
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
    imgPath: {
      type: DataTypes.STRING,
      as: "img_path",
    },
  };

  static defaults = {
    imgPath: "",
  };
}
