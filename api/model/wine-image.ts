export class WineImage {
  _id!: number;
  account_id: number;
  wine_id: number;
  content: string;
  extension: string;

  constructor(wineImage: WineImageDTO, account_id: number, wine_id: number) {
    this.account_id = account_id;
    this.wine_id = wine_id;
    this.content = wineImage.content;
    this.extension = wineImage.extension;
  }

  static toDTO(wineImage: WineImage): WineImageDTO {
    return {
      content: wineImage.content,
      extension: wineImage.extension,
    };
  }
}

export interface WineImageDTO {
  content: string;
  extension: string;
}
