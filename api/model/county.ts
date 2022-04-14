export class County {
  _id!: number;
  account_id: number;
  id: number;
  name: string;
  pref_order: number;

  constructor(county: CountyDTO, accountId: number) {
    this.account_id = accountId;
    this.id = county.id;
    this.name = county.name;
    this.pref_order = county.prefOrder;
  }

  get tableName(): string {
    return "county"
  }

  static toDTO(county: County): CountyDTO {
    return {
      id: county.id,
      name: county.name,
      prefOrder: county.pref_order,
    };
  }
}

export interface CountyDTO {
  id: number;
  name: string;
  prefOrder: number;
}
