from flask import Flask, render_template, url_for
import pyodbc

app = Flask(__name__)


@app.route("/")
def homepage():
    return render_template("homepage.html")


@app.route("/perfil")
def perfil():
    return render_template("perfil.html")

@app.route("/livro")
def livro():
    return render_template("livro.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/criarconta")
def criarconta():
    return render_template("criarconta.html")

if __name__ == "__main__":
    app.run(debug=True)