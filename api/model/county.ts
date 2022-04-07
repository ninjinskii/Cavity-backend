export class County {
  _id!: number;
  userId: number;
  id: number;
  name: string;
  pref_order: number;

  constructor(county: CountyDTO, userId: number) {
    this.userId = userId;
    this.id = county.id;
    this.name = county.name;
    this.pref_order = county.prefOrder;
  }
}

export interface CountyDTO {
  id: number;
  name: string;
  prefOrder: number;
}
