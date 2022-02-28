from dataclasses import dataclass
from database import Database


db = Database.get_instance()


@dataclass
class FReview(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    bottle_id = db.Column(db.Integer, unique=False, nullable=False)
    review_id = db.Column(db.Integer, unique=False, nullable=False)
    value = db.Column(db.Integer, unique=False, nullable=False)

    def __init__(self, user_id, bottle_id, review_id, value) -> None:
        self.user_id = user_id
        self.bottle_id = bottle_id
        self.review_id = review_id
        self.value = value

    def from_json(fReview, user_id):
        return FReview(
            user_id,
            fReview["bottle_id"],
            fReview["review_id"],
            fReview["value"],
        )
