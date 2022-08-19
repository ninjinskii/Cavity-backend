import { DataTypes, Model } from "./model.ts";

export class Friend implements Model {
  table = "friend";
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
    name: DataTypes.STRING,
    imgPath: {
      type: DataTypes.STRING,
      as: "img_path",
    },
  };

  defaults = {
    imgPath: "",
  };
}
