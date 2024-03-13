export class HistoryEntry {
  constructor(
    public _id: number,
    public accountId: number,
    public id: number,
    public date: number,
    public bottleId: number,
    public tastingId: number | null,
    public comment: string,
    public type: number,
    public favorite: number,
  ) {
  }
}
