import { DataTypes, Model } from "./model.ts";

export class TastingXFriend implements Model{
  table = "tasting_x_friend";
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
