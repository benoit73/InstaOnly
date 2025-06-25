# app/routes.py

from flask import Blueprint, request, jsonify
from .models import User, db
from .instagram_manager import InstagramManager

main = Blueprint('main', __name__)

@main.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password or not email:
        return jsonify({'error': 'Username and password are required'}), 400

    new_user = User(username=username, password=password, email=email)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User added successfully'}), 201

@main.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_list = [{'id': user.id, 'username': user.username, 'email': user.email} for user in users]
    return jsonify(users_list), 200

@main.route('/instagram/login', methods=['POST'])
def instagram_login():
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    instagram_manager = InstagramManager(user_id)
    if instagram_manager.client:
        return jsonify({'message': 'Logged in successfully'}), 200
    else:
        return jsonify({'error': 'Login failed'}), 401

@main.route('/instagram/logout', methods=['POST'])
def instagram_logout():
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    instagram_manager = InstagramManager(user_id)
    result = instagram_manager.logout()
    if result:
        return jsonify({'message': 'Logged out successfully'}), 200
    else:
        return jsonify({'error': 'Logout failed'}), 500

@main.route('/instagram/post_photo', methods=['POST'])
def instagram_post_photo():
    data = request.get_json()
    user_id = data.get('user_id')
    photo_path = data.get('photo_path')
    caption = data.get('caption')

    if not user_id or not photo_path or not caption:
        return jsonify({'error': 'User ID, photo path, and caption are required'}), 400

    instagram_manager = InstagramManager(user_id)
    result = instagram_manager.post_photo(photo_path, caption)
    if result:
        return jsonify({'message': 'Photo posted successfully'}), 200
    else:
        return jsonify({'error': 'Failed to post photo'}), 500

@main.route('/instagram/post_story', methods=['POST'])
def instagram_post_story():
    data = request.get_json()
    user_id = data.get('user_id')
    photo_path = data.get('photo_path')
    caption = data.get('caption')

    if not user_id or not photo_path or not caption:
        return jsonify({'error': 'User ID, photo path, and caption are required'}), 400

    instagram_manager = InstagramManager(user_id)
    result = instagram_manager.post_story(photo_path, caption)
    if result:
        return jsonify({'message': 'Story posted successfully'}), 200
    else:
        return jsonify({'error': 'Failed to post story'}), 500

        @main.route('/instagram/get_user', methods=['GET'])
        def instagram_get_user():
            user_id = request.args.get('user_id')

            if not user_id:
                return jsonify({'error': 'User ID is required'}), 400

            instagram_manager = InstagramManager(user_id)
            user_details = instagram_manager.get_user_details()
            if user_details:
                return jsonify(user_details), 200
            else:
                return jsonify({'error': 'Failed to retrieve user details'}), 500