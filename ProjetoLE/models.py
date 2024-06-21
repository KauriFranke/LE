from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from sqlalchemy.orm import relationship
from sqlalchemy.schema import ForeignKey
from sqlalchemy import Integer, String, Column

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

class Estilo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    classes = db.relationship('Classe', backref='estilo', lazy=True)

class TipoSubClasse(db.Model):
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)

class SubClasse(db.Model):
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String(200), nullable=True)
    tipo_id = Column(Integer, ForeignKey('tipo_sub_classe.id'), nullable=False)
    tipo = relationship('TipoSubClasse')

class Classe(db.Model):
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String(200), nullable=True)
    estilo_id = Column(Integer, ForeignKey('estilo.id'), nullable=False)
    type_id1 = Column(Integer, ForeignKey('tipo_sub_classe.id'), nullable=False)
    type_id2 = Column(Integer, ForeignKey('tipo_sub_classe.id'), nullable=False)
    sub_classes1 = relationship('SubClasse', primaryjoin="foreign(Classe.type_id1)==SubClasse.tipo_id")
    sub_classes2 = relationship('SubClasse', primaryjoin="foreign(Classe.type_id2)==SubClasse.tipo_id")

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