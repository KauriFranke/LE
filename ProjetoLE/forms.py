from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField , SelectField
from wtforms.validators import DataRequired, Email, EqualTo, ValidationError
from .models import User

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
    class_name = StringField('Class', validators=[DataRequired()])
    ancestry = SelectField('Ancestry', coerce=int, validators=[DataRequired()])
    sub_ancestry = SelectField('Sub-Ancestry', coerce=int, choices=[], validators=[DataRequired()])
    submit = SubmitField('Create Character')