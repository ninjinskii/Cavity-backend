from dataclasses import dataclass
from database import Database


db = Database.get_instance()


@dataclass
class TastingXFriend(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    tasting_id = db.Column(db.Integer, unique=False, nullable=False)
    friend_id = db.Column(db.Integer, unique=False, nullable=False)

    def __init__(self, user_id, tasting_id, friend_id) -> None:
        self.user_id = user_id
        self.tasting_id = tasting_id
        self.friend_id = friend_id

    def from_json(tastingXFriend, user_id):
        return TastingXFriend(
            user_id,
            tastingXFriend["tasting_id"],
            tastingXFriend["friend_id"],
        )
