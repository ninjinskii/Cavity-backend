import { DataTypes, Model } from "../../deps.ts";

export class TastingXFriend extends Model{
  static table = "tasting_x_friend";
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
    tastingId: {
      type: DataTypes.INTEGER,
      as: "tasting_id",
    },
    friendId: {
      type: DataTypes.INTEGER,
      as: "friend_id",
    },
  };
}
