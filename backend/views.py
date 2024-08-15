from flask import Flask, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import os
from functools import wraps
import jwt
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///events.db')
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(150), nullable=False)
    events = db.relationship('Event', backref='user', lazy=True)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    date = db.Column(db.DateTime, nullable=False)
    organizer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'message': 'Token is missing!'}), 403
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Token is invalid!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated_function

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return make_response('Could not verify', 401, {'WWW-Authenticate' : 'Basic realm="Login required!"'})
    user = User.query.filter_by(username=auth.username).first()
    if user and bcrypt.check_password_hash(user.password, auth.password):
        token = jwt.encode({'user_id': user.id, 'exp': datetime.utcnow() + timedelta(hours=12)}, app.config['SECRET_KEY'])
        return jsonify({'token': token})
    return make_response('Could not verify', 401, {'WWW-Authenticate' : 'Basic realm="Login required!"'})

@app.route('/events', methods=['POST'])
@token_required
def create_event(current_user):
    data = request.get_json()
    new_event = Event(title=data['title'], description=data.get('description', ""), date=datetime.strptime(data['date'], '%Y-%m-%d'), organizer_id=current_user.id)
    db.session.add(new_event)
    db.session.commit()
    return jsonify({'message': 'Event created successfully'}), 201

@app.route('/events', methods=['GET'])
@token_required
def get_all_events(current_user):
    events = Event.query.filter_by(organizer_id=current_user.id).all()
    output = []
    for event in events:
        event_data = {'id': event.id, 'title': event.title, 'description': event.description, 'date': event.date.strftime('%Y-%m-%d')}
        output.append(event_data)
    return jsonify({'events': output})

@app.route('/events/<int:event_id>', methods=['GET'])
@token_required
def get_one_event(current_user, event_id):
    event = Event.query.filter_by(id=event_id, organizer_id=current_user.id).first()
    if not event:
        abort(404)
    event_data = {'id': event.id, 'title': event.title, 'description': event.description, 'date': event.date.strftime('%Y-%m-%d')}
    return jsonify(event_data)

@app.route('/events/<int:event_id>', methods=['PUT'])
@token_required
def update_event(current_user, event_id):
    event = Event.query.filter_by(id=event_id, organizer_id=current_user.id).first()
    if not event:
        abort(404)
    data = request.get_json()
    event.title = data['title']
    event.description = data.get('description', "")
    event.date = datetime.strptime(data['date'], '%Y-%m-%d')
    db.session.commit()
    return jsonify({'message': 'Event updated successfully'})

@app.route('/events/<int:event_id>', methods=['DELETE'])
@token_required
def delete_event(current_user, event_id):
    event = Event.query.filter_by(id=event_id, organizer_id=current_user.id).first()
    if not event:
        abort(404)
    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Event deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True)