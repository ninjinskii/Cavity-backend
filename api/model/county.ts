import PersistableUserData from "./persistable-user-data.ts";

export class County extends PersistableUserData {
  _id!: number;
  account_id: number;
  id: number;
  name: string;
  pref_order: number;

  readonly tableName = "county";

  constructor(county: CountyDTO, accountId: number) {
    super();
    this.account_id = accountId;
    this.id = county.id;
    this.name = county.name;
    this.pref_order = county.prefOrder;
  }

  toDTO(): CountyDTO {
    return {
      id: this.id,
      name: this.name,
      prefOrder: this.pref_order,
    };
  }
}

export interface CountyDTO {
  id: number;
  name: string;
  prefOrder: number;
}
