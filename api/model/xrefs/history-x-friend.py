from dataclasses import dataclass
from database import Database


db = Database.get_instance()


@dataclass
class HistoryXFriend(db.Model):
    _id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    history_entry_id = db.Column(db.Integer, unique=False, nullable=False)
    friend_id = db.Column(db.Integer, unique=False, nullable=False)

    def __init__(self, user_id, history_entry_id, friend_id) -> None:
        self.user_id = user_id
        self.history_entry_id = history_entry_id
        self.friend_id = friend_id

    def from_json(historyXFriend, user_id):
        return HistoryXFriend(
            user_id,
            historyXFriend["history_entry_id"],
            historyXFriend["friend_id"],
        )
