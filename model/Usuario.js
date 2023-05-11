const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
class Usuario {
  constructor(nome, cpf, endereco, email, senha, telefone) {
    this.nome = nome;
    this.cpf = cpf;
    this.endereco = endereco;
    this.email = email;
    this.senha = senha;
    this.telefone = telefone;
  }

  async adicionar() {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const [rows, fields] = await connection.execute(
      "INSERT INTO usuario (nome, cpf, endereco, email, senha, telefone) VALUES (?, ?, ?, ?, ?, ?)",
      [
        this.nome,
        this.cpf,
        this.endereco,
        this.email,
        this.senha,
        this.telefone,
      ]
    );

    await connection.end();

    return rows.insertId;
  }

  static async editar(id, usuario) {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const [rows, fields] = await connection.execute(
      "SELECT id FROM usuario WHERE id = ?",
      [id]
    );

    const [editedRows, editedFields] = await connection.execute(
      'UPDATE usuario SET nome=?, cpf=?, endereco=?, email=?, senha=?, telefone=? WHERE id=?',
      [
        usuario.nome,
        usuario.cpf,
        usuario.endereco,
        usuario.email,
        usuario.senha,
        usuario.telefone,
        id
      ]
    );

    await connection.end();

    const IdEditado = rows[0].id;

    return IdEditado;
  }

  static async buscarPorId(id) {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const [rows, fields] = await connection.execute(
      "SELECT id FROM usuario WHERE id = ?",
      [id]
    );

    await connection.end();

    return rows;
  }

  static async excluir(id) {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const [rows, fields] = await connection.execute(
      "SELECT id FROM usuario WHERE id = ?",
      [id]
    );

    const [deletedRows, deletedFields] = await connection.execute(
      "DELETE FROM usuario WHERE id = ?",
      [id]
    );

    await connection.end();

    const IdDeletado = rows[0].id;

    return IdDeletado;
  }
}

module.exports = Usuario;
