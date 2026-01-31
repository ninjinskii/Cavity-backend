export class Bottle {
  constructor(
    public _id: number,
    public accountId: number,
    public id: number,
    public wineId: number,
    public vintage: number,
    public apogee: number | null,
    public isFavorite: number,
    public price: number,
    public currency: string | null,
    public otherInfo: string,
    public buyLocation: string,
    public buyDate: number,
    public tastingTasteComment: string,
    public bottleSize: string,
    public consumed: number,
    public tastingId: number | null,
    public isSelected: boolean,
    public pdfPath: string,
  ) {
  }
}
