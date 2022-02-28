from dataclasses import dataclass
from database import Database


db = Database.get_instance()


@dataclass
class Grape(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    id = db.Column(db.Integer, unique=False, nullable=False)
    name = db.Column(db.String, unique=False, nullable=False)

    def __init__(self, user_id, id, name) -> None:
        self.user_id = user_id
        self.id = id
        self.name = name

    def from_json(grape, user_id):
        return Grape(
            user_id,
            grape["id"],
            grape["name"],
        )
