from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv
from flask_httpauth import HTTPBasicAuth

load_dotenv()  # Load environment variables

app = Flask(__name__)
auth = HTTPBasicAuth()

# Configurations
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True)
    password_hash = db.Column(db.String(128))
  
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    location = db.Column(db.String(100))
    time = db.Column(db.String(50))
    organizer_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    registrations = db.relationship('Registration', backref='event', lazy=True)

class Registration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'))

@db.event.listens_for(Event.__table__, 'after_create')
def insert_initial_events(*args, **kwargs):
    db.session.add(Event(name='Sample Event', location='Sample Location', time='12:00 PM'))
    db.session.commit()

# Auth
@auth.verify_password
def verify_password(username, password):
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        return user

# Routes
@app.route('/register', methods=['POST'])
def register():
    username = request.json.get('username')
    password = request.json.get('password')
    if username is None or password is None:
        return jsonify({"message": "Missing arguments"}), 400
    if User.query.filter_by(username=username).first() is not None:
        return jsonify({"message": "User already exists"}), 400
    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User successfully registered"}), 201

@app.route('/events', methods=['GET'])
@auth.login_required
def get_events():
    events = Event.query.all()
    return jsonify([{'name': event.name, 'location': event.location, 'time': event.time} for event in events])

@app.route('/events', methods=['POST'])
@auth.login_required
def create_event():
    name = request.json.get('name')
    location = request.json.get('location')
    time = request.json.get('time')
    if name is None or location is None or time is None:
        return jsonify({"message": "Missing arguments"}), 400
    event = Event(name=name, location=location, time=time)
    db.session.add(event)
    db.session.commit()
    return jsonify({"message": "Event successfully created"}), 201

@app.route('/events/<int:event_id>', methods=['PUT'])
@auth.login_required
def update_event(event_id):
    event = Event.query.get(event_id)
    if event is None:
        return jsonify({"message": "Event not found"}), 404
    event.name = request.json.get('name', event.name)
    event.location = request.json.get('location', event.location)
    event.time = request.json.get('time', event.time)
    db.session.commit()
    return jsonify({"message": "Event updated successfully"})

@app.route('/events/<int:event_id>', methods=['DELETE'])
@auth.login_required
def delete_event(event_id):
    event = Event.query.get(event_id)
    if event is None:
        return jsonify({"message": "Event not found"}), 404
    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "Event deleted successfully"})

@app.route('/events/<int:event_id>/register', methods=['POST'])
@auth.login_required
def register_to_event(event_id):
    event = Event.query.get(event_id)
    if event is None:
        return jsonify({"message": "Event not found"}), 404
    user_id = request.json.get('user_id')
    registration = Registration(user_id=user_id, event_id=event_id)
    db.session.add(registration)
    db.session.commit()
    return jsonify({"message": "Successfully registered to the event"})

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)