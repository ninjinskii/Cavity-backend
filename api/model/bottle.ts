export class Bottle {
  _id!: number;
  account_id: number;
  id: number;
  wine_id: number;
  vintage: number;
  apogee: number;
  is_favorite: number;
  price: number;
  currency: string;
  other_info: string;
  buy_location: string;
  buy_date: number;
  tasting_taste_comment: string;
  bottle_size: string;
  pdf_path: string;
  consumed: number;
  tasting_id: number | null;

  constructor(bottle: BottleDTO, accountId: number) {
    this.account_id = accountId;
    this.id = bottle.id;
    this.wine_id = bottle.wineId;
    this.vintage = bottle.vintage;
    this.apogee = bottle.apogee;
    this.is_favorite = bottle.isFavorite;
    this.price = bottle.price;
    this.currency = bottle.currency;
    this.other_info = bottle.otherInfo;
    this.buy_location = bottle.buyLocation;
    this.buy_date = bottle.buyDate;
    this.tasting_taste_comment = bottle.tastingTasteComment;
    this.bottle_size = bottle.bottleSize;
    this.pdf_path = bottle.pdfPath;
    this.consumed = bottle.consumed;
    this.tasting_id = bottle.tastingId || null;
  }

  static toDTO(bottle: Bottle): BottleDTO {
    return {
      id: bottle.id,
      wineId: bottle.wine_id,
      vintage: bottle.vintage,
      apogee: bottle.apogee,
      isFavorite: bottle.is_favorite,
      price: bottle.price,
      currency: bottle.currency,
      otherInfo: bottle.other_info,
      buyLocation: bottle.buy_location,
      buyDate: bottle.buy_date,
      tastingTasteComment: bottle.tasting_taste_comment,
      bottleSize: bottle.bottle_size,
      pdfPath: bottle.pdf_path,
      consumed: bottle.consumed,
      tastingId: bottle.tasting_id,
    };
  }
}

export interface BottleDTO {
  id: number;
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
  pdfPath: string;
  consumed: number;
  tastingId: number | null;
}
