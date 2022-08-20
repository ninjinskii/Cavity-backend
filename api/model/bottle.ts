export interface Bottle {
  _id?:number;
  id: number;
  accountId: number;
  wineId: number;
  vintage: number;
  apogee: number;
  isFavorite: number;
  price: number;
  currency: string;
  otherInfo: string;
  buyLocation: string;
  buyDate: number;
  tastingTasteComment: string;
  bottleSize: string;
  consumed: number;
  tastingId: number | null;
  isSelected: number;
  pdfPath: string;
}
