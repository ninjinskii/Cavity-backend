export class Review {
  constructor(
    public _id: number,
    public accountId: number,
    public id: number,
    public contestName: string,
    public type: number,
  ) {
  }
}
