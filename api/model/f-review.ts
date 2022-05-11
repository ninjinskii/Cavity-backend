import { DataTypes, Model } from "../../deps.ts";

export class FReview extends Model {
  static table = "f_review";
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
    reviewId: {
      type: DataTypes.INTEGER,
      as: "review_id",
    },
    value: DataTypes.INTEGER,
  };
}
