import jwt

from hashlib import md5
from operator import imod, itemgetter

from flask import Flask, json, jsonify, request
from sqlalchemy import delete
from .database import Database

from .model.user import User
from .model.wine import Wine
from .util import (
    send_confirmation_mail,
    table_exists,
    generate_account_confirmation_code,
)
from .auth import authenticate, generate_auth_token  # AuthException ?

app = Flask(__name__)
app.config.from_object("api.config.Config")

db = Database.get_instance()
db.init_app(app)
db.create_all(app=app)


@app.route("/")
def hello_world():
    users = User.query.all()
    html = "<ul>"

    for user in users:
        html += (
            "<li>"
            + user.email
            + " "
            + user.password
            + ", registered ? : "
            + str(user.confirmed_registration)
            + " , registration code:"
            + str(user.registration_code)
            + "</li>"
        )

    html += "</ul>"

    return html


@app.route("/showwines")
def show_wines():
    wines = Wine.query.all()
    print(wines)

    html = "<ul>"

    for wine in wines:
        html += (
            "<li>"
            + str(wine._id)
            + "/"
            + str(wine.user_id)
            + "/"
            + str(wine.id)
            + "/"
            + wine.name
            + "/"
            + wine.naming
            + "/"
            + wine.color
            + "</li>"
        )

    html += "</ul>"

    return html


@app.post("/auth/login")
def login():
    email, password = get_request_parameters(request, "email", "password")
    hashed_password = md5(password.encode()).hexdigest()
    user = User.query.filter_by(email=email, password=hashed_password).first()

    if user is not None:
        if user.confirmed_registration:
            token = generate_auth_token(user.id, app)
            # user.token = token
            # db.session.commit()
            return jsonify({"token": token})
        else:
            return "Account confirmation needed", 400
    else:
        return "Unknown user", 404


@app.post("/register")
def register():
    email, password = get_request_parameters(request, "email", "password")
    hashed_password = md5(password.encode()).hexdigest()

    if not table_exists(db, "user"):
        User.__table__.create(db.engine)

    isDuplicate = len(User.query.filter_by(email=email).all()) > 0

    if isDuplicate:
        return "User already exists", 400

    registration_code = generate_account_confirmation_code()
    user = User(email, hashed_password, registration_code)
    send_confirmation_mail(user)
    db.session.add(user)
    db.session.commit()

    return "", 204


@app.post("/confirm-registration")
def confirm_registration():
    email, registration_code = get_request_parameters(
        request, "email", "registration_code"
    )
    user = db.session.query(User).filter_by(email=email).first()

    if user is None:
        return "Unknown user", 403

    if registration_code == user.registration_code:
        user.confirmed_registration = True
        db.session.commit()

        return "", 204

    else:
        return "Registration code is invalid", 400


@app.get("/wines")
def get_wines():
    user_id = -1

    try:
        user_id = authenticate(app, request)
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired"}), 401
    except jwt.jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

    if user_id == -1:
        return "Unknown user", 404

    if not table_exists(db, "wine"):
        Wine.__table__.create(db.engine)

    pname, color = get_request_parameters(request, "pname", "color")
    entry = Wine(pname, color)
    db.session.add(entry)
    db.session.commit()
    return "wine added"


@app.post("/wines")
def post_wines():
    user_id = -1

    try:
        user_id = authenticate(app, request)
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired"}), 401
    except jwt.jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

    if user_id == -1:
        return "Unknown user", 404

    wines = get_request_parameters(request, "wines")

    if not table_exists(db, "wine"):
        User.__table__.create(db.engine)
    else:
        query = delete(Wine).where(Wine.user_id == user_id)
        db.session.execute(query)

    user_wines = list(map(lambda wine: Wine.from_json(wine, user_id), wines))

    db.session.add_all(user_wines)
    db.session.commit()

    return "", 204


@app.get("/purge")
def purge():
    if table_exists(db, "wine"):
        Wine.__table__.drop(db.engine)
        return "Table purged"
    else:
        return "No table"


def get_request_parameters(request, *parameters):
    if request.method == "POST":
        return itemgetter(*parameters)(request.json)
    else:
        result = ()

        for arg in parameters:
            result += (request.args.get(arg),)

        return result
