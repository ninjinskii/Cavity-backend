import jwt


def generate_auth_token(user_id, app) -> str:
    payload = {"expiration": None, "user_id": user_id}
    return jwt.encode(payload, app.config.get("SECRET_KEY"), algorithm="HS256")


def authenticate(app, request) -> int:
    auth_header = request.headers.get("Authorization")

    if auth_header:
        auth_token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(
                auth_token, app.config.get("SECRET_KEY"), algorithms="HS256"
            )
            user_id = payload["user_id"]
            print("user_id:" + str(user_id))
            return user_id
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
            raise e
            raise AuthException("Authentication failed.")


class AuthException(Exception):
    pass
