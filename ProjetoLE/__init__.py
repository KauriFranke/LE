import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_migrate import Migrate
from sqlalchemy import inspect

db = SQLAlchemy()
login_manager = LoginManager()
migrate = Migrate()
admin = Admin(template_mode='bootstrap3', base_template='admin/base.html')

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_secret_key'

    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, 'instance', 'site.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    admin.init_app(app)

    from ProjetoLE.models import User, Character, Ancestry, SubAncestry, Estilo, Classe, SubClasse, Guilda, Elemento

    admin.add_view(ModelView(User, db.session, endpoint='user'))
    admin.add_view(ModelView(Character, db.session, endpoint='character'))
    admin.add_view(ModelView(Ancestry, db.session, endpoint='ancestry'))
    admin.add_view(ModelView(SubAncestry, db.session, endpoint='subancestry'))
    admin.add_view(ModelView(Estilo, db.session, endpoint='estilo'))
    admin.add_view(ModelView(Classe, db.session, endpoint='classe'))
    admin.add_view(ModelView(SubClasse, db.session, endpoint='subclasse'))
    admin.add_view(ModelView(Guilda, db.session, endpoint='guilda'))
    admin.add_view(ModelView(Elemento, db.session, endpoint='elemento'))

    from .routes import main, admin as admin_bp  # Importa e renomeia o blueprint admin
    app.register_blueprint(main)
    app.register_blueprint(admin_bp, url_prefix='/admin', name='admin_panel')  # Registra o blueprint admin com prefixo /admin e nome único

    @app.context_processor
    def inject_tables():
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        return dict(get_tables=lambda: tables)
    
    with app.app_context():
        db.create_all()
    
    return app

@login_manager.user_loader
def load_user(user_id):
    from .models import User
    return User.query.get(int(user_id))