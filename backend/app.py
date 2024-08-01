from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv
from flask_httpauth import HTTPBasicAuth
from sqlalchemy.exc import SQLAlchemyError
from flask_caching import Cache

load_dotenv()  # Load environment variables

app = Flask(__name__)
auth = HTTPBasicAuth()
cache = Cache(app, config={'CACHE_TYPE': 'SimpleCache'})

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
    cache.clear()  # Clear cache when new events are created
    try:
        db.session.add(Event(name='Sample Event', location='Sample Location', time='12:00 PM'))
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        app.logger.error(f'Error inserting initial events: {str(e)}')

# Auth
@auth.verify_password
def verify_password(username, password):
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        return user
    return None

# Caching the events list to reduce database queries
@app.route('/events', methods=['GET'])
@auth.login_required
@cache.cached(timeout=60)  # Cache this view for 60 seconds
def get_events():
    try:
        events = Event.query.all()
        return jsonify([{'name': event.name, 'location': event.location, 'time': event.time} for event in events])
    except SQLAlchemyError as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Other routes remain unchanged

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)