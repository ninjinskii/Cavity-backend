export class TastingAction {
  constructor(
    public _id: number,
    public accountId: number,
    public id: number,
    public type: string,
    public bottleId: number,
    public done: number,
  ) {
  }
}
