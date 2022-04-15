export class QGrape {
  _id!: number;
  account_id: number;
  bottle_id: number;
  grape_id: number;
  percentage: number;

  constructor(qGrape: QGrapeDTO, account_id: number) {
    this.account_id = account_id;
    this.bottle_id = qGrape.bottleId;
    this.grape_id = qGrape.grapeId;
    this.percentage = qGrape.percentage;
  }

  static toDTO(qGrape: QGrape): QGrapeDTO {
    return {
      bottleId: qGrape.bottle_id,
      grapeId: qGrape.grape_id,
      percentage: qGrape.percentage,
    };
  }
}

export interface QGrapeDTO {
  bottleId: number;
  grapeId: number;
  percentage: number;
}
