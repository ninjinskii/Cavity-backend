from dataclasses import dataclass

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


@dataclass
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    token = db.Column(db.String, unique=True)

    def __init__(self, email, password) -> None:
        self.email = email
        self.password = password


@dataclass
class Wine(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    id = db.Column(db.Integer, unique=True, nullable=False)
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
        Wine(
            user_id,
            wine.id,
            wine.name,
            wine.naming,
            wine.color,
            wine.cuvee,
            wine.is_organic,
            wine.img_path,
            wine.county_id,
        ) 
