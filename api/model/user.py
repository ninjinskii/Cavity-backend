from dataclasses import dataclass
from database import Database


db = Database.get_instance()

@dataclass
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    token = db.Column(db.String, unique=True)

    def __init__(self, email, password) -> None:
        self.email = email
        self.password = password
