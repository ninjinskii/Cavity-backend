from dataclasses import dataclass
from database import Database


db = Database.get_instance()


@dataclass
class Review(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    id = db.Column(db.Integer, unique=False, nullable=False)
    contest_name = db.Column(db.String, unique=False, nullable=False)
    type = db.Column(db.Integer, unique=False, nullable=False)

    def __init__(self, user_id, id, contest_name, type) -> None:
        self.user_id = user_id
        self.id = id
        self.contest_name = contest_name
        self.type = type

    def from_json(review, user_id):
        return Review(
            user_id,
            review["id"],
            review["contest_name"],
            review["type"],
        )
