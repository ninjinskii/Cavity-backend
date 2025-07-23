export class Bottle {
  constructor(
    public _id: number,
    public accountId: number,
    public id: number,
    public wineId: number,
    public vintage: number,
    public apogee: number,
    public isFavorite: number,
    public price: number,
    public currency: string,
    public otherInfo: string,
    public buyLocation: string,
    public buyDate: number,
    public tastingTasteComment: string,
    public bottleSize: string,
    public consumed: number,
    public tastingId: number | null,
    public isSelected: boolean,
    public pdfPath: string,
    public alcohol: number,
    public storageLocation: string | null,
  ) {
  }
}
