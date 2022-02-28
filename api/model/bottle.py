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
        self.id = id
        self.wine_id = wine_id
        self.vintage = vintage
        self.apogee = apogee
        self.is_favorite = is_favorite
        self.price = price
        self.currency = currency
        self.other_info = other_info
        self.buy_location = buy_location
        self.buy_date = buy_date
        self.tasting_taste_comment = tasting_taste_comment
        self.bottle_size = bottle_size
        self.pdf_path = pdf_path
        self.consumed = consumed
        self.tasting_id = tasting_id

    def from_json(bottle, user_id):
        return Bottle(
            user_id,
            bottle["id"],
            bottle["wine_id"],
            bottle["vintage"],
            bottle["apogee"],
            bottle["is_favorite"],
            bottle["price"],
            bottle["currency"],
            bottle["other_info"],
            bottle["buy_location"],
            bottle["buy_date"],
            bottle["tasting_taste_comment"],
            bottle["bottle_size"],
            bottle["pdf_path"],
            bottle["consumed"],
            bottle["tasting_id"],
        )
