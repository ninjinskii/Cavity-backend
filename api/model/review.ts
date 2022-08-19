import { DataTypes, Model } from "./model.ts";

export class Review implements Model {
  table = "review";
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
    contestName: {
      type: DataTypes.STRING,
      as: "contest_name",
    },
    type: DataTypes.INTEGER,
  };
}
