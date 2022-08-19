import { Model, DataTypes } from "./model.ts";

export class FReview implements Model {
  table = "f_review";
  fields = {
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
