from flask import Blueprint, render_template, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from . import db
from .models import User, Character
from .forms import RegistrationForm, LoginForm, CharacterForm

main = Blueprint('main', __name__)

@main.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.perfil'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Registration successful! You can now log in.')
        return redirect(url_for('main.login'))
    return render_template('criarconta.html', form=form)

@main.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.perfil'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            return redirect(url_for('main.perfil'))
        else:
            flash('Login unsuccessful. Please check email and password.')
    return render_template('login.html', form=form)

@main.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.login'))

@main.route('/perfil')
@login_required
def perfil():
    characters= Character.query.filter_by(user_id=current_user.id).all()
    return render_template('perfil.html', name=current_user.username)

@main.route('/homepage')
def homepage ():
    return render_template('homepage.html')

@main.route('/criarpersonagem', methods=['GET', 'POST'])
@login_required
def criarpersonagem():
    form = CharacterForm()
    if form.validate_on_submit():
        character = Character(
            name=form.name.data,
            class_name=form.class_name.data,
            ancestry_id=form.ancestry.data,
            sub_ancestry_id=form.sub_ancestry.data,
            user_id=current_user.id
        )
        db.session.add(character)
        db.session.commit()
        flash('Character created successfully!')
        return redirect(url_for('main.perfil'))
    return render_template('criarpersonagem.html', form=form)