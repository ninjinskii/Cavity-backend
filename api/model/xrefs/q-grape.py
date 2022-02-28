from dataclasses import dataclass
from database import Database


db = Database.get_instance()


@dataclass
class QGrape(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    bottle_id = db.Column(db.Integer, unique=False, nullable=False)
    grape_id = db.Column(db.Integer, unique=False, nullable=False)
    percentage = db.Column(db.Integer, unique=False, nullable=False)

    def __init__(self, user_id, bottle_id, grape_id, percentage) -> None:
        self.user_id = user_id
        self.bottle_id = bottle_id
        self.grape_id = grape_id
        self.percentage = percentage

    def from_json(qGrape, user_id):
        return QGrape(
            user_id,
            qGrape["bottle_id"],
            qGrape["grape_id"],
            qGrape["percentage"],
        )
