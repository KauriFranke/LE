from flask import Blueprint, render_template, redirect, url_for, flash, jsonify, request
from flask_login import login_user, logout_user, login_required, current_user
from . import db
from .models import db, User, Character, Ancestry, SubAncestry, Estilo, Classe, SubClasse, Guilda, Profissao, TipoSubClasse, Elemento, Vantagem, Resistencia, Pericia, Atributo, sub_ancestry_pericia, ancestry_pericia, CharacterPericia
from .forms import RegistrationForm, LoginForm, CharacterForm, AddColumnForm, ModifyColumnForm
from flask_migrate import upgrade, migrate, init
from sqlalchemy import inspect
import os, logging
from werkzeug.utils import secure_filename

main = Blueprint('main', __name__)
admin = Blueprint('admin', __name__, url_prefix='/admin')  # Definindo um nome único e prefixo para o blueprint admin

logging.basicConfig(level=logging.DEBUG)

UPLOAD_FOLDER = 'static/img/characters'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_column_type(column_type):
    if column_type == 'String':
        return 'TEXT'
    elif column_type == 'Integer':
        return 'INTEGER'
    elif column_type == 'Boolean':
        return 'BOOLEAN'
    elif column_type == 'Float':
        return 'FLOAT'

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
    characters = Character.query.filter_by(user_id=current_user.id).all()
    return render_template('perfil.html', name=current_user.username, characters=characters)

@main.route('/ficha_personagem/<int:character_id>', methods=['GET', 'POST'])
@login_required
def ficha_personagem(character_id):
    character = Character.query.get_or_404(character_id)
    
    if character.user_id != current_user.id:
        flash('Você não tem permissão para acessar esta ficha.')
        return redirect(url_for('main.homepage'))

    if request.method == 'POST':
        data = request.get_json()
        try:
            character.personalidade = data.get('personalidade', character.personalidade)
            character.ideais = data.get('ideais', character.ideais)
            character.objetivos = data.get('objetivos', character.objetivos)
            character.defeitos_medos = data.get('defeitos_medos', character.defeitos_medos)
            db.session.commit()
            return jsonify(success=True)
        except Exception as e:
            db.session.rollback()
            return jsonify(success=False, error=str(e))

    sub_classe1 = SubClasse.query.get(character.sub_classe1_id)
    sub_classe1_elemento = Elemento.query.get(sub_classe1.elemento_id) if sub_classe1 else None
    sub_classe2 = SubClasse.query.get(character.sub_classe2_id)
    sub_classe2_elemento = Elemento.query.get(sub_classe2.elemento_id) if sub_classe2 else None

    elementos = [sub_classe1_elemento, sub_classe2_elemento]

    vantagens = []
    resistencias = []

    for elemento in elementos:
        if elemento:
            vantagens.extend(Vantagem.query.filter_by(elemento_id=elemento.id).all())
            resistencias.extend(Resistencia.query.filter_by(elemento_id=elemento.id).all())

    proficiencias = character.classe.proficiencias  # Supondo que as proficiências estão relacionadas à classe do personagem

    vida = character.calcular_vida()
    pm = character.calcular_pm()
    proficiencia = character.calcular_proficiencia()

    # Calcular o meio da lista de proficiências
    prof_mid = len(proficiencias) // 2
    
    return render_template('ficha_personagem.html', character=character, elementos=elementos, vantagens=vantagens, resistencias=resistencias, vida=vida, pm=pm, proficiencia=proficiencia, proficiencias=proficiencias, prof_mid=prof_mid)

@main.route('/update_traits/<int:character_id>', methods=['POST'])
@login_required
def update_traits(character_id):
    character = Character.query.get_or_404(character_id)
    if character.user_id != current_user.id:
        return jsonify(success=False, error="Unauthorized"), 403

    data = request.get_json()
    character.personalidade = data.get('personalidade')
    character.ideais = data.get('ideais')
    character.objetivos = data.get('objetivos')
    character.defeitos_medos = data.get('defeitos_medos')

    try:
        db.session.commit()
        return jsonify(success=True)
    except Exception as e:
        db.session.rollback()
        return jsonify(success=False, error=str(e))

@main.route('/homepage')
def homepage():
    return render_template('homepage.html')

@main.route('/criarpersonagem', methods=['GET', 'POST'])
@login_required
def criarpersonagem():
    if request.method == 'GET':
        form = CharacterForm()
        return render_template('criarpersonagem.html', form=form)
   
    if request.method == 'POST':
        data = request.form
        image_file = request.files['image']
        
        if image_file:
            filename = secure_filename(image_file.filename)
            image_path = os.path.join(UPLOAD_FOLDER, filename)
            image_file.save(image_path)
        else:
            filename = None

        try:
            character = Character(
                name=data['name'],
                user_id=current_user.id,
                ancestry_id=data['ancestry'],
                sub_ancestry_id=data['sub_ancestry'],
                estilo_id=data['estilo'],
                classe_id=data['classe'],
                sub_classe1_id=data['sub_classe1'],
                sub_classe2_id=data['sub_classe2'],
                guilda_id=data['guilda'],
                profissao_id=data['profissao'],
                forca=data['forca'],
                agilidade=data['agilidade'],
                inteligencia=data['inteligencia'],
                presenca=data['presenca'],
                image=filename
            )
            db.session.add(character)
            db.session.commit()

            for pericia_id in data.getlist('profissao_pericias'):
                pericia_treinada = CharacterPericia(character_id=character.id, pericia_id=pericia_id)
                db.session.add(pericia_treinada)

            for pericia_id in data.getlist('ancestry_pericias'):
                pericia_treinada = CharacterPericia(character_id=character.id, pericia_id=pericia_id)
                db.session.add(pericia_treinada)
            
            db.session.commit()   
            return jsonify(success=True)
        except Exception as e:
            db.session.rollback()
            print(f"Error: {e}")
            return jsonify(success=False, error=str(e))
        
@main.route('/get_sub_ancestries/<int:ancestral_id>', methods=['GET'])
@login_required
def get_sub_ancestries(ancestral_id):
    sub_ancestralidades = SubAncestry.query.filter_by(ancestry_id=ancestral_id).all()
    sub_ancestries_data = []

    for sub_ancestral in sub_ancestralidades:
        elemento_obrigatorio = None
        if sub_ancestral.elemento_id:
            elemento = Elemento.query.get(sub_ancestral.elemento_id)
            elemento_obrigatorio = elemento.name if elemento else None

        sub_ancestries_data.append({
            "id": sub_ancestral.id,
            "name": sub_ancestral.name,
            "elemento_id": sub_ancestral.elemento_id,
            "elemento_name": elemento_obrigatorio,
            "image_url": sub_ancestral.image_url
        })

    return jsonify(sub_ancestries_data)

@main.route('/get_classes_by_estilo/<estilo_id>', methods=['GET'])
@login_required
def get_classes_by_estilo(estilo_id):
    classes = Classe.query.filter_by(estilo_id=estilo_id).all()
    return jsonify([{'id': c.id, 'name': c.name, 'description': c.description} for c in classes])

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

    sub_classes_data = [{"id": sub_classe.id, "name": sub_classe.name, "description": sub_classe.description, "tipo_id": sub_classe.tipo_id, "elemento_id": sub_classe.elemento_id, "image_url": sub_classe.image_url} for sub_classe in sub_classes]

    return jsonify({
        "sub_classes": sub_classes_data,
        "types": [
            {"id": classe.type_id1, "name": type1.name},
            {"id": classe.type_id2, "name": type2.name}
        ]
    })

@main.route('/get_guildas', methods=['GET'])
@login_required
def get_guildas():
    guildas = Guilda.query.all()
    return jsonify([{'id': g.id, 'name': g.name, 'description': g.description} for g in guildas])

@main.route('/get_profissoes_by_guilda/<guilda_id>', methods=['GET'])
@login_required
def get_profissoes_by_guilda(guilda_id):
    profissoes = Profissao.query.filter_by(guilda_id=guilda_id).all()
    return jsonify([{'id': profissao.id, 'name': profissao.name, 'description': profissao.description} for profissao in profissoes])

@main.route('/get_pericias_by_profissao/<int:profissao_id>', methods=['GET'])
@login_required
def get_pericias_by_profissao(profissao_id):
    profissao = Profissao.query.get(profissao_id)
    if not profissao:
        return jsonify({"error": "Profissão not found"}), 404
    pericias = [{'id': p.id, 'name': p.name} for p in profissao.pericias]
    return jsonify({'pericias': pericias})

@main.route('/get_pericias_by_ancestry/<int:ancestry_id>/<int:sub_ancestry_id>', methods=['GET'])
@login_required
def get_pericias_by_ancestry(ancestry_id, sub_ancestry_id):
    ancestry = Ancestry.query.get(ancestry_id)
    
    if ancestry.usa_pericias_sub_ancestral:
        pericias = db.session.query(Pericia).join(sub_ancestry_pericia, Pericia.id == sub_ancestry_pericia.c.pericia_id).filter(sub_ancestry_pericia.c.sub_ancestry_id == sub_ancestry_id).all()
    else:
        pericias = db.session.query(Pericia).join(ancestry_pericia, Pericia.id == ancestry_pericia.c.pericia_id).filter(ancestry_pericia.c.ancestry_id == ancestry_id).all()
    
    pericias_data = [{
        'id': pericia.id,
        'name': pericia.name,
        'atributo_id': pericia.atributo_id,
        'tipo_pericia_id': pericia.tipo_pericia_id
    } for pericia in pericias]
    
    return jsonify({'pericias': pericias_data})

@main.route('/get_all_pericias', methods=['GET'])
def get_all_pericias():
    pericias = Pericia.query.all()
    pericias_data = [{'id': p.id, 'name': p.name,'atributo_id': p.atributo_id, 'tipo_id': p.tipo_pericia_id} for p in pericias]
    atributos = Atributo.query.all()
    atributos_data = [{'id': a.id, 'name': a.name} for a in atributos]
    return jsonify({'pericias': pericias_data, 'atributos': atributos_data})

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
    return redirect(url_for('admin.dashboard'))

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
    return redirect(url_for('admin.dashboard'))

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
    return redirect(url_for('admin.dashboard'))

@admin.route('/dashboard')
@login_required
def dashboard():
    if not current_user.is_admin:
        flash('Acesso negado.')
        return redirect(url_for('main.homepage'))
   
    return render_template('admin/dashboard.html')

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
        return redirect(url_for('admin.add_column'))

    return render_template('admin/add_column.html', form=form)

@admin.route('/view_table/<table_name>', methods=['GET'])
@login_required
def view_table(table_name):
    if not current_user.is_admin:
        flash('Acesso negado.')
        return redirect(url_for('main.homepage'))

    inspector = inspect(db.engine)
    if table_name not in inspector.get_table_names():
        flash('Tabela não encontrada.')
        return redirect(url_for('admin.dashboard'))

    table = db.Table(table_name, db.metadata, autoload_with=db.engine)
    query = db.session.query(table).all()
    columns = table.columns.keys()
   
    return render_template('admin/view_table.html', table_name=table_name, columns=columns, rows=query)

@admin.route('/update_table/<table_name>', methods=['POST'])
@login_required
def update_table(table_name):
    if not current_user.is_admin:
        flash('Acesso negado.')
        return redirect(url_for('main.homepage'))

    inspector = inspect(db.engine)
    if table_name not in inspector.get_table_names():
        flash('Tabela não encontrada.')
        return redirect(url_for('admin.dashboard'))

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

    return redirect(url_for('admin.view_table', table_name=table_name))

@admin.route('/add_row/<table_name>', methods=['POST'])
@login_required
def add_row(table_name):
    if not current_user.is_admin:
        flash('Acesso negado.')
        return redirect(url_for('main.homepage'))

    inspector = inspect(db.engine)
    if table_name not in inspector.get_table_names():
        flash('Tabela não encontrada.')
        return redirect(url_for('admin.dashboard'))

    table = db.Table(table_name, db.metadata, autoload_with=db.engine)
    new_row = {}
    for column in table.columns.keys():
        if column in request.form:
            new_row[column] = request.form[column]

    insert_stmt = table.insert().values(**new_row)
    db.session.execute(insert_stmt)
    db.session.commit()
    flash('Novo registro adicionado com sucesso!')

    return redirect(url_for('admin.view_table', table_name=table_name))

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
            return redirect(url_for('admin.modify_column'))

    elif request.method == 'GET':
        form.column_name.choices = []

    return render_template('admin/modify_column.html', form=form)

@admin.route('/get_columns/<table_name>', methods=['GET'])
@login_required
def get_columns(table_name):
    inspector = inspect(db.engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return jsonify(columns)