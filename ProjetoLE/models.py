from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from sqlalchemy.orm import relationship
from sqlalchemy.schema import ForeignKey
from sqlalchemy import Integer, String, Column, Table

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

# Definindo as tabelas de associação antes de serem usadas nos relacionamentos
ancestry_pericia = db.Table('ancestry_pericia',
    db.Column('ancestry_id', db.Integer, db.ForeignKey('ancestry.id'), primary_key=True),
    db.Column('pericia_id', db.Integer, db.ForeignKey('pericia.id'), primary_key=True)
)

profissao_pericia = db.Table('profissao_pericia',
    db.Column('profissao_id', db.Integer, db.ForeignKey('profissao.id'), primary_key=True),
    db.Column('pericia_id', db.Integer, db.ForeignKey('pericia.id'), primary_key=True)
)

sub_ancestry_pericia = db.Table('sub_ancestry_pericia',
    db.Column('sub_ancestry_id', db.Integer, db.ForeignKey('sub_ancestry.id'), primary_key=True),
    db.Column('pericia_id', db.Integer, db.ForeignKey('pericia.id'), primary_key=True)
)

proficiencia_classe = db.Table('proficiencia_classe',
    db.Column('classe_id', db.Integer, db.ForeignKey('classe.id'), primary_key=True),
    db.Column('proficiencia_id', db.Integer, db.ForeignKey('proficiencia.id'), primary_key=True)
)

class CharacterPericia(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), primary_key=True)
    pericia_id = db.Column(db.Integer, db.ForeignKey('pericia.id'), primary_key=True)
    treinado = db.Column(db.Boolean, default=False)

    character = db.relationship('Character', backref=db.backref('character_pericias', cascade='all, delete-orphan'))
    pericia = db.relationship('Pericia', backref=db.backref('character_pericias', cascade='all, delete-orphan'))

class Character(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ancestry_id = db.Column(db.Integer, db.ForeignKey('ancestry.id'), nullable=False)
    sub_ancestry_id = db.Column(db.Integer, db.ForeignKey('sub_ancestry.id'), nullable=False)
    estilo_id = db.Column(db.Integer, db.ForeignKey('estilo.id'), nullable=False)
    classe_id = db.Column(db.Integer, db.ForeignKey('classe.id'), nullable=False)
    sub_classe1_id = db.Column(db.Integer, db.ForeignKey('sub_classe.id'), nullable=False)
    sub_classe2_id = db.Column(db.Integer, db.ForeignKey('sub_classe.id'), nullable=False)
    guilda_id = db.Column(db.Integer, db.ForeignKey('guilda.id'), nullable=False)
    profissao_id = db.Column(db.Integer, db.ForeignKey('profissao.id'), nullable=False)
    level = db.Column(db.Integer, nullable=False, default=1)
    forca = db.Column(db.Integer, nullable=False, default=1)
    agilidade = db.Column(db.Integer, nullable=False, default=1)
    inteligencia = db.Column(db.Integer, nullable=False, default=1)
    presenca = db.Column(db.Integer, nullable=False, default=1)
    image = db.Column(db.String(200), nullable=True)
    personalidade = db.Column(db.String(500), nullable=True)
    ideais = db.Column(db.String(500), nullable=True)
    objetivos = db.Column(db.String(500), nullable=True)
    defeitos_medos = db.Column(db.String(500), nullable=True)

    ancestry = db.relationship('Ancestry', backref='characters')
    sub_ancestry = db.relationship('SubAncestry', backref='characters')
    estilo = db.relationship('Estilo', backref='characters')
    classe = db.relationship('Classe', backref='characters')
    sub_classe1 = db.relationship('SubClasse', foreign_keys=[sub_classe1_id])
    sub_classe2 = db.relationship('SubClasse', foreign_keys=[sub_classe2_id])
    guilda = db.relationship('Guilda', backref='characters')
    profissao = db.relationship('Profissao', backref='characters')
    pericia_treinada = db.relationship('CharacterPericia', backref='character_ref', lazy=True)

    def calcular_vida(self):
        return self.classe.vida_inicial + (self.level * self.classe.vida_por_nivel)
    
    def calcular_pm(self):
        return self.classe.pm_inicial + (self.level * self.classe.pm_por_nivel)
    
    def calcular_proficiencia(self):
        return 3 + (self.level // 5)
    
    def get_pericias(self):
        pericias = set()
        if self.profissao:
            pericias.update(self.profissao.pericias)
        if self.ancestry:
            pericias.update(self.ancestry.pericias)
        return list(pericias)

class Ancestry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    sub_ancestries = db.relationship('SubAncestry', backref='parent_ancestry', lazy=True)
    usa_pericias_sub_ancestral = db.Column(db.Boolean, default=False)
    pericias = db.relationship('Pericia', secondary=ancestry_pericia, back_populates='ancestries')

class SubAncestry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    ancestry_id = db.Column(db.Integer, db.ForeignKey('ancestry.id'), nullable=False)
    elemento_id = db.Column(db.Integer, db.ForeignKey('elemento.id'), nullable=True)
    image_url = db.Column(db.String(200), nullable=True)

    ancestry = db.relationship('Ancestry', back_populates='sub_ancestries', overlaps="parent_ancestry")
    elemento = db.relationship('Elemento')

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
    elemento_id = db.Column(db.Integer, db.ForeignKey('elemento.id'), nullable=True)
    image_url = db.Column(db.String(200))

    tipo = relationship('TipoSubClasse')
    elemento = db.relationship('Elemento')

class Classe(db.Model):
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String(200), nullable=True)
    estilo_id = Column(Integer, ForeignKey('estilo.id'), nullable=False)
    type_id1 = Column(Integer, ForeignKey('tipo_sub_classe.id'), nullable=False)
    type_id2 = Column(Integer, ForeignKey('tipo_sub_classe.id'), nullable=False)
    vida_inicial = db.Column(db.Integer, nullable=False, default=10)
    vida_por_nivel = db.Column(db.Integer, nullable=False, default=3)
    pm_inicial = db.Column(db.Integer, nullable=False, default=30)
    pm_por_nivel = db.Column(db.Integer, nullable=False, default=2)
    proficiencias = db.relationship('Proficiencia', secondary=proficiencia_classe, backref=db.backref('classes', lazy=True))
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
    pericias = db.relationship('Pericia', secondary=profissao_pericia, back_populates='profissoes')

class Elemento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True, nullable=False)

class Vantagem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    elemento_id = db.Column(db.Integer, db.ForeignKey('elemento.id'), nullable=False)
    vantagem_elemento_id = db.Column(db.Integer, db.ForeignKey('elemento.id'), nullable=False)

    elemento = db.relationship('Elemento', foreign_keys=[elemento_id])
    vantagem_elemento = db.relationship('Elemento', foreign_keys=[vantagem_elemento_id])

class Resistencia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    elemento_id = db.Column(db.Integer, db.ForeignKey('elemento.id'), nullable=False)
    resistencia_elemento_id = db.Column(db.Integer, db.ForeignKey('elemento.id'), nullable=False)

    elemento = db.relationship('Elemento', foreign_keys=[elemento_id])
    resistencia_elemento = db.relationship('Elemento', foreign_keys=[resistencia_elemento_id])

class TipoPericia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    pericias = db.relationship('Pericia', backref='tipo', lazy=True)

class Atributo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    pericias = db.relationship('Pericia', backref='atributo', lazy=True)

class Pericia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    atributo_id = db.Column(db.Integer, db.ForeignKey('atributo.id'), nullable=False)
    tipo_pericia_id = db.Column(db.Integer, db.ForeignKey('tipo_pericia.id'), nullable=False)
    ancestries = db.relationship('Ancestry', secondary=ancestry_pericia, back_populates='pericias')
    profissoes = db.relationship('Profissao', secondary=profissao_pericia, back_populates='pericias')

class Proficiencia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
