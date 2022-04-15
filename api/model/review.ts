export class Review {
  _id!: number;
  account_id: number;
  id: number;
  contest_name: string;
  type: number;

  constructor(review: ReviewDTO, account_id: number) {
    this.account_id = account_id;
    this.id = review.id;
    this.contest_name = review.contestName;
    this.type = review.type;
  }

  static toDTO(review: Review): ReviewDTO {
    return {
      id: review.id,
      contestName: review.contest_name,
      type: review.type,
    };
  }
}

export interface ReviewDTO {
  id: number;
  contestName: string;
  type: number;
}
