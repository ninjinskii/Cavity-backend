from flask import Flask, request, jsonify
from model import User, db, Wine
from operator import itemgetter
from util import *


app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:plout@db/cavity'
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.secret_key = 'secret string'

db.init_app(app)
db.create_all(app=app)


@app.route('/')
def hello_world():
    return 'Hey, we have Flask in a Docker container!'

@app.post('/register')
def register():
    # email, password = itemgetter('email', 'password')(request.form)
    email, password = get_request_parameters(request, 'email', 'password')

    if not table_exists(db, "user"):
        User.__table__.create(db.engine)

    user = User(email, password)
    db.session.add(user)
    db.session.commit()

    return jsonify(
        user = user
    )

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
    return 'wine added'

@app.post("/wines")
def post_wines():
    bruh, name = get_request_parameters(request, "bruh", "name")
    print("______________________________")
    print(bruh, name)
    return 'POST request accepted'    

@app.get("/purge")
def purge():
    if table_exists(db, "wine"):
        Wine.__table__.drop(db.engine)
        return 'Table purged'
    else:
        return 'No table'   

def get_request_parameters(request, *parameters):
    if request.method == 'POST':
        print("_______________________________")
        print(request.json)
        print(*parameters)
        return itemgetter(*parameters)(request.json)
    else:
        result = ()

        for arg in parameters:
            result += (request.args.get(arg),)

        return result

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

