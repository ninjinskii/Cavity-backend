export class HistoryXFriend {
  _id!: number;
  account_id: number;
  history_entry_id: number;
  friend_id: number;

  constructor(historyFriendXRef: HistoryXFriendDTO, account_id: number) {
    this.account_id = account_id;
    this.history_entry_id = historyFriendXRef.historyEntryId;
    this.friend_id = historyFriendXRef.friendId;
  }

  static toDTO(historyFriendXRef: HistoryXFriend): HistoryXFriendDTO {
    return {
      historyEntryId: historyFriendXRef.history_entry_id,
      friendId: historyFriendXRef.friend_id,
    };
  }
}

export interface HistoryXFriendDTO {
  historyEntryId: number;
  friendId: number;
}
