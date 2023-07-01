const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
class Usuario {
  constructor(nome, cpf, endereco, email, senha, telefone, cidade, pais, sobre, foto) {
    this.nome = nome;
    this.cpf = cpf;
    this.endereco = endereco;
    this.email = email;
    this.senha = senha;
    this.telefone = telefone;
    this.cidade = cidade;
    this.pais = pais;
    this.sobre = sobre;
    this.foto = foto;
  }

  async adicionar() {
    const senhaHash = await bcrypt.hash(this.senha, 10);

    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '41491912',
      database: 'epampa',
    });

    const [rows, fields] = await connection.execute(
      'INSERT INTO usuario (nome, cpf, endereco, email, senha, telefone, cidade, pais) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [this.nome, this.cpf, this.endereco, this.email, senhaHash, this.telefone, this.cidade, this.pais]
    );

    await connection.end();

    return rows.insertId;
  }

  static async editar(id, usuario) {
    const senhaHash = usuario.senha ? await bcrypt.hash(usuario.senha, 10) : null;

    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '41491912',
      database: 'epampa',
    });

    const [editedRows, editedFields] = await connection.execute(
      'UPDATE usuario SET nome=?, cpf=?, endereco=?, email=?, senha=?, telefone=?, cidade=?, pais=?, sobre=? WHERE id=?',
      [
        usuario.nome,
        usuario.cpf,
        usuario.endereco,
        usuario.email,
        senhaHash,
        usuario.telefone,
        usuario.cidade,
        usuario.pais,
        usuario.sobre,
        Number.parseInt(id),
      ]
    );

    await connection.end();

    return editedRows;
  }

  static async buscarPorId(id) {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const [rows, fields] = await connection.execute(
      "SELECT * FROM usuario WHERE id = ?",
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

    const [deletedRows, deletedFields] = await connection.execute(
      "DELETE FROM usuario WHERE id = ?",
      [id]
    );

    await connection.end();

    return deletedRows;
  }

  static async editarFoto(id, fotoData) {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const [editedRows, editedFields] = await connection.execute(
      "UPDATE usuario SET foto=? WHERE id=?",
      [fotoData, Number.parseInt(id)]
    );

    await connection.end();

    return editedRows;
  }
}

module.exports = Usuario, upload;
