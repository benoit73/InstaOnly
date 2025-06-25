from . import db
from sqlalchemy.dialects.postgresql import JSON

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    session = db.Column(JSON, nullable=True)
    settings = db.Column(JSON, nullable=True)
    infos_updated_at = db.Column(db.DateTime, nullable=True)
    avatar = db.Column(db.String(500), nullable=True)
    followers_count = db.Column(db.Integer, nullable=True)
    posts_count = db.Column(db.Integer, nullable=True)
    stories_count = db.Column(db.Integer, nullable=True)
    biography = db.Column(db.String(1000), nullable=True)
    
    def saveSession(self, session):
        self.session = session
        db.session.commit()
    def __repr__(self):
        return f'<User {self.username}>'
