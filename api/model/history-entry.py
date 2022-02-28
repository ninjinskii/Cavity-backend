from dataclasses import dataclass
from database import Database


db = Database.get_instance()


@dataclass
class HistoryEntry(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    id = db.Column(db.Integer, unique=False, nullable=False)
    date = db.Column(db.Integer, unique=False, nullable=False)
    bottle_id = db.Column(db.Integer, unique=False, nullable=False)
    tasting_id = db.Column(db.Integer, unique=False, nullable=True)
    comment = db.Column(db.String, unique=False, nullable=False)
    type = db.Column(db.Integer, unique=False, nullable=False)
    favorite = db.Column(db.Integer, unique=False, nullable=False)

    def __init__(
        self, user_id, id, date, bottle_id, tasting_id, comment, type, favorite
    ) -> None:
        self.user_id = user_id
        self.id = id
        self.date = date
        self.bottle_id = bottle_id
        self.tasting_id = tasting_id
        self.comment = comment
        self.type = type
        self.favorite = favorite

    def from_json(entry, user_id):
        return HistoryEntry(
            user_id,
            entry["id"],
            entry["date"],
            entry["bottle_id"],
            entry["tasting_id"],
            entry["comment"],
            entry["type"],
            entry["favorite"],
        )
