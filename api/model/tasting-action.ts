export class TastingAction {
  _id!: number;
  account_id: number;
  id: number;
  type: number;
  bottle_id: number;
  done: number;

  constructor(tastingAction: TastingActionDTO, account_id: number) {
    this.account_id = account_id;
    this.id = tastingAction.id;
    this.type = tastingAction.type;
    this.bottle_id = tastingAction.bottleId;
    this.done = tastingAction.done;
  }

  static toDTO(tastingAction: TastingAction): TastingActionDTO {
    return {
      id: tastingAction.id,
      type: tastingAction.type,
      bottleId: tastingAction.bottle_id,
      done: tastingAction.done,
    };
  }
}

export interface TastingActionDTO {
  id: number;
  type: number;
  bottleId: number;
  done: number;
}
