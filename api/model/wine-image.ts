export class WineImage {
  _id!: number;
  account_id: number;
  wine_id: number;
  image: string;
  extension: string;

  constructor(wineImage: WineImageDTO, account_id: number, wine_id: number) {
    this.account_id = account_id;
    this.wine_id = wine_id;
    this.image = wineImage.image;
    this.extension = wineImage.extension;
  }

  static toDTO(wineImage: WineImage): WineImageDTO {
    return {
      image: wineImage.image,
      extension: wineImage.extension,
    };
  }
}

export interface WineImageDTO {
  image: string;
  extension: string;
}
