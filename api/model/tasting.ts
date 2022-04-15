export class Tasting {
  _id!: number;
  account_id: number;
  id: number;
  date: number;
  is_midday: number;
  opportunity: string;
  done: number;

  constructor(tasting: TastingDTO, account_id: number) {
    this.account_id = account_id;
    this.id = tasting.id;
    this.date = tasting.date;
    this.is_midday = tasting.isMidday;
    this.opportunity = tasting.opportunity;
    this.done = tasting.done;
  }

  static toDTO(tasting: Tasting): TastingDTO {
    return {
      id: tasting.id,
      date: tasting.date,
      isMidday: tasting.is_midday,
      opportunity: tasting.opportunity,
      done: tasting.done,
    };
  }
}

export interface TastingDTO {
  id: number;
  date: number;
  isMidday: number;
  opportunity: string;
  done: number;
}
