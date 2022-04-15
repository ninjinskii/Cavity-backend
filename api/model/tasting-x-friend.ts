export class TastingXFriend {
  _id!: number;
  account_id: number;
  tasting_id: number;
  friend_id: number;

  constructor(tastingFriendXRef: TastingXFriendDTO, account_id: number) {
    this.account_id = account_id;
    this.tasting_id = tastingFriendXRef.tastingId;
    this.friend_id = tastingFriendXRef.friendId;
  }

  static toDTO(tastingFriendXRef: TastingXFriend): TastingXFriendDTO {
    return {
      tastingId: tastingFriendXRef.tasting_id,
      friendId: tastingFriendXRef.friend_id,
    };
  }
}

export interface TastingXFriendDTO {
  tastingId: number;
  friendId: number;
}
