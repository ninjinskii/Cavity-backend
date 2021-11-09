from flask.cli import FlaskGroup

from project import app, db

cli = FlaskGroup(app)


@cli.command("reset_db")
def reset_db():
    db.drop_all()
    db.create_all()
    db.session.commit()


if __name__ == "__main__":
    cli()
