from flask_sqlalchemy import SQLAlchemy


class Database:
    __instance = None

    def __init__(self):
        if Database.__instance is not None:
            raise Exception(
                "Utiliser la méthode get_instance() pour obtenir une instance de l'objet"
            )

    @staticmethod
    def get_instance():
        if Database.__instance is None:
            Database.__instance = SQLAlchemy()

        return Database.__instance
