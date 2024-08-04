import datetime
import jwt

import requests
from flask import Blueprint, jsonify, request, make_response
from my_env_secrets import JWT_SIGN_KEY

api_blueprint = Blueprint('api', __name__)
cookie_key = 'brickbrain_token'


@api_blueprint.route('/login', methods=['POST'])
def save_rebrickable_token():
    try:
        body = request.get_json()
        user = body.get('user')
        ukey = body.get('ukey')

        if not user or not ukey:
            return jsonify({"message": "Missing 'user' or 'ukey' parameter"}), 400

        ujwt = create_jwt_token(user, ukey)

        response = make_response(jsonify({"message": "Cookie has been saved"}))
        response.set_cookie(cookie_key, ujwt)

        return response

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@api_blueprint.route('/test', methods=['GET'])
def test():
    if handle_request_jwt()[1] is not None:
        return handle_request_jwt()

    return "jo"


def create_jwt_token(user, user_key):
    payload = {
        'user': user,
        'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=12),
        'ukey': user_key
    }
    token = jwt.encode(payload, JWT_SIGN_KEY, algorithm='HS256')
    return token


def verify_jwt_token(token):
    try:
        payload = jwt.decode(token, JWT_SIGN_KEY, algorithms=['HS256'])
        return payload, None
    except jwt.ExpiredSignatureError:
        return {"message": "Token has expired"}, 401
    except jwt.InvalidTokenError:
        return {"message": "Invalid token"}, 401


def handle_request_jwt():
    cookie = request.cookies.get(cookie_key)

    if not cookie:
        return {"message": "No cookie found"}, 400

    return verify_jwt_token(cookie)

