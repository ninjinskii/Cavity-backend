from dataclasses import dataclass
from database import Database


db = Database.get_instance()


@dataclass
class TastingAction(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    id = db.Column(db.Integer, unique=False, nullable=False)
    type = db.Column(db.String, unique=False, nullable=False)
    bottle_id = db.Column(db.Integer, unique=False, nullable=False)
    done = db.Column(db.Integer, unique=False, nullable=False)

    def __init__(self, user_id, id, type, bottle_id, done) -> None:
        self.user_id = user_id
        self.id = id
        self.type = type
        self.bottle_id = bottle_id
        self.done = done

    def from_json(action, user_id):
        return TastingAction(
            user_id,
            action["id"],
            action["type"],
            action["bottle_id"],
            action["done"],
        )
