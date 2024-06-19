from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    characters = db.relationship('Character', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Character(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ancestry_name = db.Column(db.String(150), nullable=False)
    sub_ancestry_name = db.Column(db.String(150), nullable=False)
    estilo_name = db.Column(db.String(150), nullable=False)  # Adicione essa linha
    classe_name = db.Column(db.String(150), nullable=False)
    sub_classe_name = db.Column(db.String(150), nullable=False)
    guilda_id = db.Column(db.Integer, db.ForeignKey('guilda.id'), nullable=False)
    profissao_name = db.Column(db.String(150), nullable=False)
    
class Ancestry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    sub_ancestries = db.relationship('SubAncestry', backref='parent_ancestry', lazy=True)

class SubAncestry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    ancestry_id = db.Column(db.Integer, db.ForeignKey('ancestry.id'), nullable=False)

    ancestry = db.relationship('Ancestry', back_populates='sub_ancestries')

classe_sub_classe = db.Table('classe_sub_classe',
    db.Column('classe_id', db.Integer, db.ForeignKey('classe.id'), primary_key=True),
    db.Column('sub_classe_id', db.Integer, db.ForeignKey('sub_classe.id'), primary_key=True)
)

class Estilo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    classes = db.relationship('Classe', backref='estilo', lazy=True)

class Classe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    sub_classes = db.relationship('SubClasse', secondary=classe_sub_classe, backref=db.backref('classes', lazy='dynamic'))
    estilo_id = db.Column(db.Integer, db.ForeignKey('estilo.id'), nullable=False)

class TipoSubClasse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class SubClasse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    tipo_id = db.Column(db.Integer, db.ForeignKey('tipo_sub_classe.id'), nullable=False)
    classe_id = db.Column(db.Integer, db.ForeignKey('classe.id'), nullable=False)
    tipo = db.relationship('TipoSubClasse')

class Guilda(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    description = db.Column(db.String(500))
    profissoes = db.relationship('Profissao', backref='guilda', lazy=True)

class Profissao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    description = db.Column(db.String(500), nullable=True)
    guilda_id = db.Column(db.Integer, db.ForeignKey('guilda.id'), nullable=False)