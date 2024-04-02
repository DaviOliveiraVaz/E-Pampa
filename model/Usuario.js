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
  constructor(nome, cpf, endereco, email, senha, telefone, cidade, sobre, foto, cep, numero) {
    this.nome = nome;
    this.cpf = cpf;
    this.endereco = endereco;
    this.email = email;
    this.senha = senha;
    this.telefone = telefone;
    this.cidade = cidade;
    this.sobre = sobre;
    this.foto = foto;
    this.cep = cep;
    this.numero = numero;
  }

  async adicionar() {
    const senhaHash = await bcrypt.hash(this.senha, 10);
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '41491912',
      database: 'epampa',
    });
    const [existingRows, existingFields] = await connection.execute(
      'SELECT id FROM usuario WHERE email = ?',
      [this.email]
    );
    if (existingRows.length > 0) {
      await connection.end();
      throw new Error('E-mail já utilizado');
    }
    const numero = this.numero || null;
    const cep = this.cep || null;
    const [rows, fields] = await connection.execute(
      'INSERT INTO usuario (nome, cpf, endereco, email, senha, telefone, cidade, cep, numero) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [this.nome, this.cpf, this.endereco, this.email, senhaHash, this.telefone, this.cidade, cep, numero]
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
      'UPDATE usuario SET nome=?, cpf=?, endereco=?, email=?, senha=?, telefone=?, cidade=?, sobre=? cep=?, numero=? WHERE id=?',
      [
        usuario.nome,
        usuario.cpf,
        usuario.endereco,
        usuario.email,
        senhaHash,
        usuario.telefone,
        usuario.cidade,
        usuario.sobre,
        usuario.cep,
        usuario.numero,
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
