import { DataTypes, Model } from "../../deps.ts";

export class Review extends Model {
  static table = "review";
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
    contestName: {
      type: DataTypes.STRING,
      as: "contest_name",
    },
    type: DataTypes.INTEGER,
  };
}
