from flask import Blueprint, render_template, redirect, url_for, flash, jsonify, request
from flask_login import login_user, logout_user, login_required, current_user
from . import db
from .models import User, Character, Ancestry, SubAncestry, Estilo, Classe, SubClasse, Guilda, Profissao, TipoSubClasse
from .forms import RegistrationForm, LoginForm, CharacterForm, ProfissaoForm, AddColumnForm, ModifyColumnForm
from flask_migrate import upgrade, migrate, init
from sqlalchemy import inspect
import os

main = Blueprint('main', __name__)
admin = Blueprint('admin', __name__, url_prefix='/admin')  # Definindo um nome único e prefixo para o blueprint admin

def get_column_type(column_type):
    if column_type == 'String':
        return 'TEXT'
    elif column_type == 'Integer':
        return 'INTEGER'
    elif column_type == 'Boolean':
        return 'BOOLEAN'
    elif column_type == 'Float':
        return 'FLOAT'
######################################################################################################
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
######################################################################################################
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
######################################################################################################
@main.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.login'))
######################################################################################################
@main.route('/perfil')
@login_required
def perfil():
    characters = Character.query.filter_by(user_id=current_user.id).all()
    return render_template('perfil.html', name=current_user.username, characters=characters)
######################################################################################################
@main.route('/homepage')
def homepage():
    return render_template('homepage.html')
######################################################################################################
@main.route('/criarpersonagem', methods=['GET', 'POST'])
@login_required
def criarpersonagem():
    form = CharacterForm()
    
    # Carregar sub-ancestralidades com base na ancestralidade selecionada
    if form.ancestry.data:
        ancestry_name = form.ancestry.data
        ancestry = Ancestry.query.filter_by(name=ancestry_name).first()
        if ancestry:
            form.sub_ancestry.choices = [(sa.name, sa.name) for sa in ancestry.sub_ancestries]
    
    if form.validate_on_submit():
        try:
            ancestry_name = form.ancestry.data
            sub_ancestry_name = form.sub_ancestry.data
            estilo_name = form.estilo.data
            classe_name = form.classe.data
            sub_classe_name = form.sub_classe.data
            guilda_id = form.guilda.data
            profissao_name = form.profissao.data

            character = Character(
                name=form.name.data,
                user_id=current_user.id,
                ancestry_name=ancestry_name,
                sub_ancestry_name=sub_ancestry_name,
                estilo_name=estilo_name,
                classe_name=classe_name,
                sub_classe_name=sub_classe_name,
                guilda_id=guilda_id,
                profissao_name=profissao_name
            )
            db.session.add(character)
            db.session.commit()
            flash('Character created successfully!')
            return redirect(url_for('main.perfil'))
        except Exception as e:
            db.session.rollback()
            flash(f'Error creating character: {e}', 'danger')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'Error in the {getattr(form, field).label.text} field - {error}', 'danger')
    return render_template('criarpersonagem.html', form=form)
######################################################################################################
@main.route('/get_sub_ancestries/<ancestral>')
@login_required
def get_sub_ancestries(ancestral):
    ancestry = Ancestry.query.filter_by(name=ancestral).first()
    if ancestry:
        sub_ancestries = SubAncestry.query.filter_by(ancestry_id=ancestry.id).all()
        return jsonify([{'name': sa.name} for sa in sub_ancestries])
    return jsonify([])
######################################################################################################
@main.route('/get_classes_by_estilo/<estilo_id>')
@login_required
def get_classes_by_estilo(estilo_id):
    classes = Classe.query.filter_by(estilo_id=estilo_id).all()
    return jsonify([{'id': c.id, 'name': c.name, 'description': c.description} for c in classes])
######################################################################################################
############################################################################
@main.route('/get_sub_classes_by_classe/<int:classe_id>', methods=['GET'])
def get_sub_classes_by_classe(classe_id):
    classe = Classe.query.get(classe_id)
    if not classe:
        return jsonify({"error": "Classe not found"}), 404

    sub_classes = SubClasse.query.filter(
        (SubClasse.tipo_id == classe.type_id1) | (SubClasse.tipo_id == classe.type_id2)
    ).all()

    type1 = TipoSubClasse.query.get(classe.type_id1)
    type2 = TipoSubClasse.query.get(classe.type_id2)

    sub_classes_data = [{"id": sub_classe.id, "name": sub_classe.name, "description": sub_classe.description, "tipo_id": sub_classe.tipo_id} for sub_classe in sub_classes]

    return jsonify({
        "sub_classes": sub_classes_data,
        "types": [
            {"id": classe.type_id1, "name": type1.name},
            {"id": classe.type_id2, "name": type2.name}
        ]
    })
######################################################################################################
@main.route('/get_guildas')
@login_required
def get_guildas():
    guildas = Guilda.query.all()
    return jsonify([{'id': g.id, 'name': g.name, 'description': g.description} for g in guildas])
######################################################################################################
@main.route('/get_profissoes_by_guilda/<guilda>')
@login_required
def get_profissoes_by_guilda(guilda):
    guilda_obj = Guilda.query.filter_by(name=guilda).first()
    if guilda_obj:
        profissoes = Profissao.query.filter_by(guilda_id=guilda_obj.id).all()
        return jsonify([{'name': p.name, 'description': p.description} for p in profissoes])
    return jsonify([])
######################################################################################################
@admin.route('/migrate/init')
@login_required
def migrate_init():
    if not current_user.is_admin:
        flash('Acesso negado.')
        return redirect(url_for('main.homepage'))

    try:
        init(directory=os.path.join(os.path.dirname(__file__), '../migrations'))
        flash('Migração inicializada com sucesso.')
    except Exception as e:
        flash(f'Erro ao inicializar migração: {e}')
    return redirect(url_for('admin_panel.dashboard'))
######################################################################################################
@admin.route('/migrate/migrate')
@login_required
def run_migrate():
    if not current_user.is_admin:
        flash('Acesso negado.')
        return redirect(url_for('main.homepage'))

    try:
        migrate(directory=os.path.join(os.path.dirname(__file__), '../migrations'))
        flash('Migração criada com sucesso.')
    except Exception as e:
        flash(f'Erro ao criar migração: {e}')
    return redirect(url_for('admin_panel.dashboard'))
######################################################################################################
@admin.route('/migrate/upgrade')
@login_required
def run_upgrade():
    if not current_user.is_admin:
        flash('Acesso negado.')
        return redirect(url_for('main.homepage'))

    try:
        upgrade(directory=os.path.join(os.path.dirname(__file__), '../migrations'))
        flash('Migração aplicada com sucesso.')
    except Exception as e:
        flash(f'Erro ao aplicar migração: {e}')
    return redirect(url_for('admin_panel.dashboard'))
######################################################################################################
@admin.route('/dashboard')
@login_required
def dashboard():
    if not current_user.is_admin:
        flash('Acesso negado.')
        return redirect(url_for('main.homepage'))
    
    return render_template('admin/dashboard.html')
######################################################################################################
@admin.route('/add_column', methods=['GET', 'POST'])
@login_required
def add_column():
    if not current_user.is_admin:
        flash('Acesso negado.')
        return redirect(url_for('main.homepage'))

    form = AddColumnForm()
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    table_choices = [(table, table.capitalize()) for table in tables]
    form.table_name.choices = table_choices
    form.related_table.choices = [('None', 'None')] + table_choices

    if form.validate_on_submit():
        table_name = form.table_name.data
        column_name = form.column_name.data
        column_type = form.column_type.data
        related_table = form.related_table.data
        related_column = form.related_column.data

        try:
            if column_type == 'ForeignKey' and related_table != 'None':
                db.session.execute(f'ALTER TABLE {table_name} ADD COLUMN {column_name}_id INTEGER')
                db.session.execute(f'ALTER TABLE {table_name} ADD CONSTRAINT fk_{column_name} FOREIGN KEY ({column_name}_id) REFERENCES {related_table}({related_column})')
                flash(f'Coluna {column_name}_id com relacionamento com {related_table}({related_column}) adicionada com sucesso à tabela {table_name}!')
            else:
                column_type_sql = get_column_type(column_type)
                db.session.execute(f'ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type_sql}')
                flash(f'Coluna {column_name} adicionada com sucesso à tabela {table_name}!')
            db.session.commit()
        except Exception as e:
            flash(f'Erro ao adicionar coluna: {e}')
        return redirect(url_for('admin_panel.add_column'))

    return render_template('admin/add_column.html', form=form)
######################################################################################################
@admin.route('/view_table/<table_name>', methods=['GET'])
@login_required
def view_table(table_name):
    if not current_user.is_admin:
        flash('Acesso negado.')
        return redirect(url_for('main.homepage'))

    inspector = inspect(db.engine)
    if table_name not in inspector.get_table_names():
        flash('Tabela não encontrada.')
        return redirect(url_for('admin_panel.dashboard'))

    table = db.Table(table_name, db.metadata, autoload_with=db.engine)
    query = db.session.query(table).all()
    columns = table.columns.keys()
    
    return render_template('admin/view_table.html', table_name=table_name, columns=columns, rows=query)
######################################################################################################
@admin.route('/update_table/<table_name>', methods=['POST'])
@login_required
def update_table(table_name):
    if not current_user.is_admin:
        flash('Acesso negado.')
        return redirect(url_for('main.homepage'))

    inspector = inspect(db.engine)
    if table_name not in inspector.get_table_names():
        flash('Tabela não encontrada.')
        return redirect(url_for('admin_panel.dashboard'))

    table = db.Table(table_name, db.metadata, autoload_with=db.engine)
    
    if 'save' in request.form:
        row_id = request.form['save']
        row_to_update = db.session.query(table).filter_by(id=row_id).first()
        update_data = {}
        for column in table.columns.keys():
            if f'{row_id}-{column}' in request.form:
                update_data[column] = request.form[f'{row_id}-{column}']
        db.session.query(table).filter_by(id=row_id).update(update_data)
        db.session.commit()
        flash('Registro atualizado com sucesso!')
    
    elif 'delete' in request.form:
        row_id = request.form['delete']
        db.session.query(table).filter_by(id=row_id).delete()
        db.session.commit()
        flash('Registro excluído com sucesso!')

    return redirect(url_for('admin_panel.view_table', table_name=table_name))
######################################################################################################
@admin.route('/add_row/<table_name>', methods=['POST'])
@login_required
def add_row(table_name):
    if not current_user.is_admin:
        flash('Acesso negado.')
        return redirect(url_for('main.homepage'))

    inspector = inspect(db.engine)
    if table_name not in inspector.get_table_names():
        flash('Tabela não encontrada.')
        return redirect(url_for('admin_panel.dashboard'))

    table = db.Table(table_name, db.metadata, autoload_with=db.engine)
    new_row = {}
    for column in table.columns.keys():
        if column in request.form:
            new_row[column] = request.form[column]

    insert_stmt = table.insert().values(**new_row)
    db.session.execute(insert_stmt)
    db.session.commit()
    flash('Novo registro adicionado com sucesso!')

    return redirect(url_for('admin_panel.view_table', table_name=table_name))
######################################################################################################
@admin.route('/modify_column', methods=['GET', 'POST'])
@login_required
def modify_column():
    if not current_user.is_admin:
        flash('Acesso negado.')
        return redirect(url_for('main.homepage'))

    form = ModifyColumnForm()
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    form.table_name.choices = [(table, table.capitalize()) for table in tables]

    if request.method == 'POST':
        if form.validate_on_submit():
            table_name = form.table_name.data
            column_name = form.column_name.data
            new_column_name = form.new_column_name.data
            column_type = form.column_type.data
            max_length = form.max_length.data

            try:
                column_type_sql = get_column_type(column_type)
                if max_length:
                    column_type_sql += f'({max_length})'
                if new_column_name:
                    db.session.execute(f'ALTER TABLE {table_name} RENAME COLUMN {column_name} TO {new_column_name}')
                    flash(f'Coluna {column_name} renomeada para {new_column_name} com sucesso!')
                    column_name = new_column_name
                db.session.execute(f'ALTER TABLE {table_name} MODIFY COLUMN {column_name} {column_type_sql}')
                flash(f'Coluna {column_name} modificada para {column_type_sql} com sucesso!')
                db.session.commit()
            except Exception as e:
                flash(f'Erro ao modificar coluna: {e}')
            return redirect(url_for('admin_panel.modify_column'))

    elif request.method == 'GET':
        form.column_name.choices = []

    return render_template('admin/modify_column.html', form=form)
######################################################################################################
@admin.route('/get_columns/<table_name>')
@login_required
def get_columns(table_name):
    inspector = inspect(db.engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return jsonify(columns)