from dataclasses import dataclass
from database import Database


db = Database.get_instance()


@dataclass
class County(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    id = db.Column(db.Integer, unique=False, nullable=False)
    name = db.Column(db.String, unique=False, nullable=False)
    pref_order = db.Column(db.Integer, unique=False, nullable=False)

    def __init__(self, user_id, id, name, pref_order) -> None:
        self.user_id = user_id
        self.id = id
        self.name = name
        self.pref_order = pref_order

    def from_json(county, user_id):
        return County(
            user_id,
            county["id"],
            county["name"],
            county["pref_order"],
        )
