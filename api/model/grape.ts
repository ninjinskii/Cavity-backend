export class Grape {
  _id!: number;
  account_id: number;
  id: number;
  name: string;

  constructor(grape: GrapeDTO, accountId: number) {
    this.account_id = accountId;
    this.id = grape.id;
    this.name = grape.name;
  }

  static toDTO(grape: Grape): GrapeDTO {
    return {
      id: grape.id,
      name: grape.name
    };
  }
}

export interface GrapeDTO {
  id: number;
  name: string;
}
