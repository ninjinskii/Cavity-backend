export class Friend {
  _id!: number;
  account_id: number;
  id: number;
  name: string;
  img_path: string;

  constructor(friend: FriendDTO, accountId: number) {
    this.account_id = accountId;
    this.id = friend.id;
    this.name = friend.name;
    this.img_path = friend.imgPath;
  }

  static toDTO(friend: Friend): FriendDTO {
    return {
      id: friend.id,
      name: friend.name,
      imgPath: friend.img_path,
    };
  }
}

export interface FriendDTO {
  id: number;
  name: string;
  imgPath: string;
}
