import { DataTypes, Model } from "./model.ts";

export class Wine implements Model {
  table = "wine";
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
    naming: DataTypes.STRING,
    color: DataTypes.STRING,
    cuvee: DataTypes.STRING,
    isOrganic: {
      type: DataTypes.INTEGER,
      as: "is_oganic",
    },
    countyId: {
      type: DataTypes.INTEGER,
      as: "county_id",
    },
    hidden: DataTypes.INTEGER,
    imgPath: {
      type: DataTypes.STRING,
      as: "img_path",
    },
  };

  defaults = {
    imgPath: "",
  };
}
