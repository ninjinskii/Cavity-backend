export class FReview {
  _id!: number;
  account_id: number;
  bottle_id: number;
  review_id: number;
  value: number;

  constructor(fReview: FReviewDTO, account_id: number) {
    this.account_id = account_id;
    this.bottle_id = fReview.bottleId;
    this.review_id = fReview.reviewId;
    this.value = fReview.value;
  }

  static toDTO(fReview: FReview): FReviewDTO {
    return {
      bottleId: fReview.bottle_id,
      reviewId: fReview.review_id,
      value: fReview.value,
    };
  }
}

export interface FReviewDTO {
  bottleId: number;
  reviewId: number;
  value: number;
}
