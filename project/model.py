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
    id = db.Column(db.Integer, primary_key=True)
    pname = db.Column(db.String(80), unique=False, nullable=False)
    color = db.Column(db.String(120), nullable=False)

    def __init__(self, pname, color) -> None:
        self.pname = pname
        self.color = color
