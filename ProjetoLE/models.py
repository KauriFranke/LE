from ProjetoLE import database


class usuario(database.Model):
    id_ = database.Coluum(database.Integer , primary_key=True)
    username = database.Coluum(database.String , nullable=False)
    email = database.Coluum(database.String , nullable=False, unique=True)
    senha = database.Coluum(database.String , nullable=False)