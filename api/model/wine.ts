export class Wine {
  constructor(
    public _id: number,
    public accountId: number,
    public id: number,
    public name: string,
    public naming: string,
    public color: string,
    public cuvee: string,
    public isOrganic: number,
    public imgPath: string,
    public countyId: number,
    public hidden: number,
  ) {
  }
}
