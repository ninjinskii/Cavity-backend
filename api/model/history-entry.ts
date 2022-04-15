export class HistoryEntry {
  _id!: number;
  account_id: number;
  id: number;
  date: number;
  bottle_id: number;
  tasting_id: number | null;
  comment: string;
  type: number;
  favorite: number;

  constructor(historyEntry: HistoryEntryDTO, account_id: number) {
    this.account_id = account_id;
    this.id = historyEntry.id;
    this.date = historyEntry.date;
    this.bottle_id = historyEntry.bottleId;
    this.tasting_id = historyEntry.tastingId;
    this.comment = historyEntry.comment;
    this.type = historyEntry.type;
    this.favorite = historyEntry.favorite;
  }

  static toDTO(historyEntry: HistoryEntry): HistoryEntryDTO {
    return {
      id: historyEntry.id,
      date: historyEntry.date,
      bottleId: historyEntry.bottle_id,
      tastingId: historyEntry.tasting_id,
      comment: historyEntry.comment,
      type: historyEntry.type,
      favorite: historyEntry.favorite,
    };
  }
}

export interface HistoryEntryDTO {
  id: number;
  date: number;
  bottleId: number;
  tastingId: number | null;
  comment: string;
  type: number;
  favorite: number;
}
