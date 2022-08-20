export interface HistoryEntry {
  _id?: number;
  id: number;
  accountId: number;
  date: number;
  bottleId: number;
  tastingId: number | null;
  comment: string;
  type: number;
  favorite: number;
}
