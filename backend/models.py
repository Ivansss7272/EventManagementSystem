from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv
from flask_caching import Cache

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

app.config['CACHE_TYPE'] = 'SimpleCache'
app.config['CACHE_DEFAULT_TIMEOUT'] = 300
cache = Cache(app)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    events_registered = db.relationship('Registration', back_populates='user', cascade="all, delete-orphan")

    def __repr__(self):
        return '<User %r>' % self.username

class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    organizer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    organizer = db.relationship('User', back_populates='organized_events')
    registrations = db.relationship('Registration', back_populates='event', cascade="all, delete-orphan")

    def __repr__(self):
        return '<Event %r>' % self.name

class Registration(db.Model):
    __tablename__ = 'registrations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    user = db.relationship('User', back_populates='events_registered')
    event = db.relationship('Event', back_populates='registrations')

    def __repr__(self):
        return '<Registration user_id=%r event_id=%r>' % (self.user_id, self.event_id)

User.organized_events = db.relationship('Event', backref='organizer', lazy=True)
Event.organizer = db.relationship('User', back_populates='organized_events')

@app.before_first_request
def create_tables():
    db.create_all()

@app.route('/events')
@cache.cached(timeout=50, key_prefix='all_events')
def list_events():
    try:
        events = Event.query.all()
        return jsonify([{'id': event.id, 'name': event.name,
                         'start_time': event.start_time.isoformat(),
                         'end_time': event.end_time.isoformat()} for event in events])
    except Exception as e:
        return jsonify({"error": "Error fetching events", "message": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)