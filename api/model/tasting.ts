export class Tasting {
  constructor(
    public _id: number,
    public accountId: number,
    public id: number,
    public date: number,
    public isMidday: boolean,
    public opportunity: string,
    public done: boolean,
  ) {
  }
}
