import datetime
import json
import os
import time

import jwt
import requests
from flask import Blueprint, jsonify, request, make_response

from my_env_secrets import JWT_SIGN_KEY
from owned_set import OwnedSet

api_blueprint = Blueprint('api', __name__)
cookie_key = 'brickbrain_token'
base_url = 'https://rebrickable.com/api/v3'
save_path = './saves'


@api_blueprint.route('/login', methods=['POST'])
def save_rebrickable_token():
    try:
        body = request.get_json()
        user = body.get('user')
        ukey = body.get('ukey')

        if not user or not ukey:
            return jsonify({"message": "Missing 'user' or 'ukey' parameter"}), 400

        ujwt = create_jwt_token(user, ukey)

        response = make_response(jsonify({"message": "Successful login!"}))
        response.set_cookie(cookie_key, ujwt, domain='127.0.0.1', httponly=False, path='/')

        file_path = os.path.join(save_path, f'{user}.json')
        if not os.path.exists(file_path):
            with open(file_path, 'w') as file:
                json.dump([], file)

        return response

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


def get_all_data_by_url_and_params(url, params=None):
    verify = handle_request_jwt()
    if verify[1] is not None:
        return verify

    ukey = verify[0]['ukey']

    headers = {
        'Authorization': f'key {ukey}'
    }

    all_data = []
    while url:
        response = requests.get(url, headers=headers, params=params)

        if response.status_code == 200:
            data = response.json()
            all_data.extend(data.get('results', []))
            url = data.get('next')
        else:
            return jsonify({'error': 'Failed to fetch data'}), response.status_code

        # Clear params after the first request because 'next' already includes them
        params = {}
        time.sleep(0.1)

    return jsonify(all_data)


def get_single_data_by_url(url):
    verify = handle_request_jwt()
    if verify[1] is not None:
        return verify

    ukey = verify[0]['ukey']

    headers = {
        'Authorization': f'key {ukey}'
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        return jsonify({'error': 'Failed to fetch data'}), response.status_code


@api_blueprint.route('/themes', methods=['GET'])
def get_themes():
    verify = handle_request_jwt()
    if verify[1] is not None:
        return verify

    ukey = verify[0]['ukey']
    url = f'{base_url}/lego/themes'
    headers = {
        f'Authorization': f'key {ukey}'
    }

    all_data = []
    while url:
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            data = response.json()
            all_data.extend(data.get('results', []))
            url = data.get('next')
        else:
            return jsonify({'error': 'Failed to fetch data'}), response.status_code

    return jsonify(all_data)


@api_blueprint.route('/sets', methods=['GET'])
def get_sets():
    theme_id = request.args.get('theme_id')
    search = request.args.get('search')

    params = {}
    if theme_id:
        params['theme_id'] = theme_id
    if search:
        params['search'] = search

    url = f'{base_url}/lego/sets/'

    return get_all_data_by_url_and_params(url, params)


@api_blueprint.route('/sets/<string:set_num>', methods=['GET'])
def get_set_by_set_num(set_num):
    url = f'{base_url}/lego/sets/{set_num}'
    return get_single_data_by_url(url)


@api_blueprint.route('/sets/<string:set_num>/parts', methods=['GET'])
def get_parts_by_set_num(set_num):
    url = f'{base_url}/lego/sets/{set_num}/parts'
    return get_all_data_by_url_and_params(url, None)


@api_blueprint.route('/sets/<string:set_num>/minifigs', methods=['GET'])
def get_minifigs_by_set_num(set_num):
    url = f'{base_url}/lego/sets/{set_num}/minifigs'
    return get_all_data_by_url_and_params(url, None)


@api_blueprint.route('/owned', methods=['POST'])
def save_owned_set():
    verify = handle_request_jwt()
    if verify[1] is not None:
        return verify

    user = verify[0].get('user')

    try:
        data = request.json

        owned_set = OwnedSet.from_dict(data)
        owned_set_dict = owned_set.to_dict()

        file_path = os.path.join(save_path, f'{user}.json')

        if os.path.exists(file_path):
            with open(file_path, 'r') as file:
                existing_data = json.load(file)
        else:
            existing_data = []

        existing_data.append(owned_set_dict)

        with open(file_path, 'w') as file:
            json.dump(existing_data, file, indent=4)

        return jsonify({"message": "Saved successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@api_blueprint.route('/owned/<string:guid>', methods=['PATCH'])
def update_owned_set(guid):
    verify = handle_request_jwt()
    if verify[1] is not None:
        return verify

    user = verify[0].get('user')

    try:
        file_path = os.path.join(save_path, f'{user}.json')

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        with open(file_path, 'r') as file:
            existing_data = json.load(file)

        owned_set = next((item for item in existing_data if item['guid'] == guid), None)
        if not owned_set:
            return jsonify({"error": "Set not found"}), 404

        for key, value in request.json.items():
            if key in owned_set:
                owned_set[key] = value

        with open(file_path, 'w') as file:
            json.dump(existing_data, file, indent=4)

        return jsonify({"message": "Set updated successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@api_blueprint.route('/owned/<string:guid>', methods=['DELETE'])
def delete_owned_set(guid):
    verify = handle_request_jwt()
    print(verify)
    if verify[1] is not None:
        return verify

    user = verify[0].get('user')

    try:
        file_path = os.path.join(save_path, f'{user}.json')

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        with open(file_path, 'r') as file:
            existing_data = json.load(file)

        owned_set = next((item for item in existing_data if item['guid'] == guid), None)
        if not owned_set:
            return jsonify({"error": "Set not found"}), 404

        existing_data.remove(owned_set)

        with open(file_path, 'w') as file:
            json.dump(existing_data, file, indent=4)

        return jsonify({"message": "Set deleted successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@api_blueprint.route('/owned', methods=['GET'])
def get_owned_sets():
    verify = handle_request_jwt()
    if verify[1] is not None:
        return verify[0]

    user = verify[0].get('user')

    try:
        file_path = os.path.join(save_path, f'{user}.json')

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        with open(file_path, 'r') as file:
            existing_data = json.load(file)

        return existing_data, 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


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
