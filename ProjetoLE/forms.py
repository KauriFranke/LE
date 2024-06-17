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
    name = StringField('Name', validators=[DataRequired()])
    ancestry = SelectField('Ancestry', validators=[DataRequired()])
    sub_ancestry = SelectField('Sub-Ancestry', validators=[DataRequired()])
    submit = SubmitField('Create Character')

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