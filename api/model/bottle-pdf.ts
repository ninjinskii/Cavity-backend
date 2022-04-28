export class BottlePdf {
  _id!: number;
  account_id: number;
  bottle_id: number;
  content: string;

  constructor(bottlePdf: BottlePdfDTO, account_id: number, bottle_id: number) {
    this.account_id = account_id;
    this.bottle_id = bottle_id;
    this.content = bottlePdf.content;
  }

  static toDTO(bottlePdf: BottlePdf): BottlePdfDTO {
    return {
      content: bottlePdf.content,
      extension: "pdf",
    };
  }
}

export interface BottlePdfDTO {
  content: string;
  extension: string;
}
