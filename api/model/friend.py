from dataclasses import dataclass
from database import Database


db = Database.get_instance()


@dataclass
class Friend(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    id = db.Column(db.Integer, unique=False, nullable=False)
    name = db.Column(db.String, unique=False, nullable=False)
    img_path = db.Column(db.String, unique=False, nullable=False)

    def __init__(self, user_id, id, name, img_path) -> None:
        self.user_id = user_id
        self.id = id
        self.name = name
        self.img_path = img_path

    def from_json(friend, user_id):
        return Friend(
            user_id,
            friend["id"],
            friend["name"],
            friend["img_path"],
        )
