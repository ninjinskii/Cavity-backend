from flask.cli import FlaskGroup

from api import app
from database import Database

cli = FlaskGroup(app)


@cli.command("reset_db")
def reset_db():
    db = Database.get_instance()
    db.drop_all()
    db.create_all()
    db.session.commit()


if __name__ == "__main__":
    cli()
