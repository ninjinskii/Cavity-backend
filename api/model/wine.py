from dataclasses import dataclass
from database import Database


db = Database.get_instance()


@dataclass
class Wine(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    id = db.Column(db.Integer, unique=False, nullable=False)
    name = db.Column(db.String, unique=False, nullable=False)
    naming = db.Column(db.String, unique=False, nullable=False)
    color = db.Column(db.String, nullable=False)
    cuvee = db.Column(db.String, nullable=False)
    is_organic = db.Column(db.Integer, nullable=False)
    img_path = db.Column(db.String, nullable=False)
    county_id = db.Column(db.Integer, nullable=False)

    def __init__(
        self, user_id, id, name, naming, color, cuvee, is_organic, img_path, county_id
    ) -> None:
        self.user_id = user_id
        self.id = id
        self.name = name
        self.naming = naming
        self.color = color
        self.cuvee = cuvee
        self.is_organic = is_organic
        self.img_path = img_path
        self.county_id = county_id

    def from_json(wine, user_id):
        return Wine(
            user_id,
            wine["id"],
            wine["name"],
            wine["naming"],
            wine["color"],
            wine["cuvee"],
            wine["is_organic"],
            wine["img_path"],
            wine["county_id"],
        )

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "naming": self.naming,
            "color": self.color,
            "cuvee": self.cuvee,
            "is_organic": self.is_organic,
            "img_path": self.img_path,
            "county_id": self.county_id,
        }
