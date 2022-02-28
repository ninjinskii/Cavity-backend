from dataclasses import dataclass
from database import Database


db = Database.get_instance()


@dataclass
class Tasting(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    id = db.Column(db.Integer, unique=False, nullable=False)
    date = db.Column(db.Integer, unique=False, nullable=False)
    isMidday = db.Column(db.Boolean, unique=False, nullable=False)
    opportunity = db.Column(db.String, unique=False, nullable=False)
    done = db.Column(db.Boolean, unique=False, nullable=False)

    def __init__(self, user_id, id, date, isMidday, opportunity, done) -> None:
        self.user_id = user_id
        self.id = id
        self.date = date
        self.isMidday = isMidday
        self.opportunity = opportunity
        self.done = done

    def from_json(tasting, user_id):
        return Tasting(
            user_id,
            tasting["id"],
            tasting["date"],
            tasting["isMidday"],
            tasting["opportunity"],
            tasting["done"],
        )
