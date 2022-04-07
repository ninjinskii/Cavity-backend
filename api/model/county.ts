export class County {
  _id!: number;
  userId: number;
  id: number;
  name: string;
  prefOrder: number;

  constructor(county: CountyDTO, userId: number) {
    this.userId = userId;
    this.id = county.id;
    this.name = county.name;
    this.prefOrder = county.prefOrder;
  }
}

export interface CountyDTO {
  id: number;
  name: string;
  prefOrder: number;
}
