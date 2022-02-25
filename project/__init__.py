from operator import itemgetter

from flask import Flask, json, jsonify, request

from .model import User, Wine, db
from .util import table_exists
from .auth import AuthException, authenticate, generate_auth_token

app = Flask(__name__)
app.config.from_object("project.config.Config")

db.init_app(app)
db.create_all(app=app)


@app.route("/")
def hello_world():
    return "Hey, we have Flask in a Docker container!"


@app.post("/register")
def register():
    # email, password = itemgetter('email', 'password')(request.form)
    email, password = get_request_parameters(request, "email", "password")

    if not table_exists(db, "user"):
        User.__table__.create(db.engine)

    user = User(email, password)
    db.session.add(user)
    db.session.commit()

    return jsonify(user=user)


@app.get("/wines")
def get_wines():
    if not table_exists(db, "wine"):
        Wine.__table__.create(db.engine)

    pname, color = get_request_parameters(request, "pname", "color")
    print("______________________________")
    print(pname, color)
    entry = Wine(pname, color)
    db.session.add(entry)
    db.session.commit()
    return "wine added"


@app.post("/wines")
def post_wines():
    # bruh, name = get_request_parameters(request, "bruh", "name")
    user_id = -1

    try:
        user_id = authenticate(app, request)
    except AuthException as e:
        return jsonify({"message": str(e)}), 401

    wines = get_request_parameters(request, "wines")

    if not table_exists(db, "wine"):
        User.__table__.create(db.engine)
    else:
        old_user_wines = Wine.query.filter_by(user_id=user_id).all()
        db.session.delete(old_user_wines)

    user_wines = map(lambda wine: Wine.from_json(wine), wines)

    db.session.add(user_wines)
    db.session.commit()

    return "", 204


@app.post("/auth/login")
def login():
    email, password = get_request_parameters(request, "email", "password")
    user = User.query.filter_by(email=email, password=password).first()

    if user:
        token = generate_auth_token(user.id, app)
        user.token = token
        db.session.commit()
        return jsonify({"token": token})
    else:
        return "", 404  # TODO: true handle


@app.get("/purge")
def purge():
    if table_exists(db, "wine"):
        Wine.__table__.drop(db.engine)
        return "Table purged"
    else:
        return "No table"


def get_request_parameters(request, *parameters):
    if request.method == "POST":
        print("_______________________________")
        print(request.json)
        print(*parameters)
        return itemgetter(*parameters)(request.json)
    else:
        result = ()

        for arg in parameters:
            result += (request.args.get(arg),)

        return result
