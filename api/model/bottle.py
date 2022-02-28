from dataclasses import dataclass
from database import Database


db = Database.get_instance()


@dataclass
class Bottle(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    id = db.Column(db.Integer, unique=False, nullable=False)
    wine_id = db.Column(db.Integer, unique=False, nullable=False)
    vintage = db.Column(db.Integer, unique=False, nullable=False)
    apogee = db.Column(db.Integer, unique=False, nullable=False)
    is_favorite = db.Column(db.Integer, unique=False, nullable=False)
    price = db.Column(db.Float, unique=False, nullable=False)
    currency = db.Column(db.String, unique=False, nullable=False)
    other_info = db.Column(db.String, unique=False, nullable=False)
    buy_location = db.Column(db.String, unique=False, nullable=False)
    buy_date = db.Column(db.Integer, unique=False, nullable=False)
    tasting_taste_comment = db.Column(db.String, unique=False, nullable=False)
    bottle_size = db.Column(db.String, unique=False, nullable=False)
    pdf_path = db.Column(db.String, unique=False, nullable=False)
    consumed = db.Column(db.Integer, unique=False, nullable=False)
    tasting_id = db.Column(db.Integer, unique=False, nullable=True)

    def from_json(bottle, user_id):
        Bottle(
            user_id,
            bottle.id,
            bottle.name,
            bottle.naming,
            bottle.color,
            bottle.cuvee,
            bottle.is_organic,
            bottle.img_path,
            bottle.county_id,
        )

    def __init__(
        self,
        user_id,
        id,
        wine_id,
        vintage,
        apogee,
        is_favorite,
        price,
        currency,
        other_info,
        buy_location,
        buy_date,
        tasting_taste_comment,
        bottle_size,
        pdf_path,
        consumed,
        tasting_id,
    ) -> None:
        self.user_id = user_id
