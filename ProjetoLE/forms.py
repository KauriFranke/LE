from flask_wtf import FlaskForm
from flask_wtf.form import _Auto
from wtforms import StringField, PasswordField, SubmitField , SelectField
from wtforms.validators import DataRequired, Email, EqualTo, ValidationError 
from .models import User, Ancestry

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Sign Up')

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('Username already exists.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email already exists.')

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

class CharacterForm(FlaskForm):
    name = StringField('Nome do Personagem', validators=[DataRequired()])
    ancestry = SelectField('Ancestralidade', choices=[], coerce=int, validators=[DataRequired()])
    sub_ancestry = SelectField('Sub-Ancestralidade', choices=[], coerce=int, validators=[DataRequired()])
    estilo = SelectField('Estilo', choices=[], coerce=int, validators=[DataRequired()])
    classe = SelectField('Classe', choices=[], coerce=int, validators=[DataRequired()])
    sub_classe1 = SelectField('Sub-Classe 1', choices=[], coerce=int, validators=[DataRequired()])
    sub_classe2 = SelectField('Sub-Classe 2', choices=[], coerce=int, validators=[DataRequired()])
    guilda = SelectField('Guilda', choices=[], coerce=int, validators=[DataRequired()])
    profissao = SelectField('Profissão', choices=[], coerce=int, validators=[DataRequired()])
    level = SelectField('Nível', choices=[], coerce=int, validators=[DataRequired()])
    forca = SelectField('Força', choices=[], coerce=int, validators=[DataRequired()])
    agilidade = SelectField('Agilidade', choices=[], coerce=int, validators=[DataRequired()])
    inteligencia = SelectField('Inteligência', choices=[], coerce=int, validators=[DataRequired()])
    presenca = SelectField('Presença', choices=[], coerce=int, validators=[DataRequired()])
    submit = SubmitField('Criar Personagem')

    def __init__(self, *args, **kwargs):
        super(CharacterForm, self).__init__(*args, **kwargs)
        self.ancestry.choices = [(a.name, a.name) for a in Ancestry.query.order_by(Ancestry.name).all()]
        self.sub_ancestry.choices = []

class AddColumnForm(FlaskForm):
    table_name = SelectField('Table', validators=[DataRequired()])
    column_name = StringField('Column Name', validators=[DataRequired()])
    column_type = SelectField('Column Type', choices=[
        ('String', 'String'), 
        ('Integer', 'Integer'), 
        ('Boolean', 'Boolean'), 
        ('Float', 'Float'),
        ('ForeignKey', 'ForeignKey')
    ], validators=[DataRequired()])
    related_table = SelectField('Related Table', validators=[DataRequired()])
    related_column = StringField('Related Column', default='id')
    submit = SubmitField('Add Column')

class ModifyColumnForm(FlaskForm):
    table_name = SelectField('Table', choices=[], validators=[DataRequired()])
    column_name = SelectField('Column', choices=[], validators=[DataRequired()])
    new_column_name = StringField('New Column Name')
    column_type = SelectField('Type', choices=[('String', 'String'), ('Integer', 'Integer'), ('Boolean', 'Boolean'), ('Float', 'Float')])
    max_length = StringField('Max Length')
    submit = SubmitField('Submit')