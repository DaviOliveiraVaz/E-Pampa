const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
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
class Empresa {
  constructor(nome, cnpj, ramo, email, senha, telefone, descricao, endereco, cidade, pais, foto) {
    this.nome = nome;
    this.cnpj = cnpj;
    this.ramo = ramo;
    this.email = email;
    this.senha = senha;
    this.telefone = telefone;
    this.descricao = descricao;
    this.endereco = endereco;
    this.cidade = cidade;
    this.pais = pais;
    this.foto = foto;
  }

  // async adicionar() {
  //   const senhaHash = await bcrypt.hash(this.senha, 10);

  //   const connection = await mysql.createConnection({
  //     host: "localhost",
  //     user: "root",
  //     password: "41491912",
  //     database: "epampa",
  //   });

  //   const [rows, fields] = await connection.execute(
  //     "INSERT INTO empresa (nome, cnpj, ramo, email, senha, telefone, endereco, cidade, pais) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  //     [this.nome, this.cnpj, this.ramo, this.email, senhaHash, this.telefone, this.endereco, this.cidade, this.pais]
  //   );
 
  //   await connection.end();

  //   return rows.insertId;
  // }

  async adicionar() {
    const senhaHash = await bcrypt.hash(this.senha, 10);

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const valores = [
      this.nome,
      this.cnpj,
      this.ramo,
      this.email,
      senhaHash,
      this.telefone,
      this.endereco,
      this.cidade,
      this.pais
    ].map((valor) => (typeof valor !== "undefined" ? valor : null));

    const [rows, fields] = await connection.execute(
      "INSERT INTO empresa (nome, cnpj, ramo, email, senha, telefone, endereco, cidade, pais) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      valores
    );

    await connection.end();

    return rows.insertId;
  }

  static async buscarPorId(id) {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const [rows, fields] = await connection.execute(
      "SELECT * FROM empresa WHERE id = ?",
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
      "DELETE FROM empresa WHERE id = ?",
      [id]
    );

    await connection.end();

    return deletedRows;
  }

  static async editar(id, empresa) {
    const senhaHash = empresa.senha ? await bcrypt.hash(empresa.senha, 10) : null;

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const [editedRows, editedFields] = await connection.execute(
      "UPDATE empresa SET nome=?, cnpj=?, ramo=?, email=?, senha=?, telefone=?, descricao=?, endereco=?, cidade=?, pais=?, foto=? WHERE id=?",
      [
        empresa.nome,
        empresa.cnpj,
        empresa.ramo,
        empresa.email,
        senhaHash,
        empresa.telefone,
        empresa.descricao,
        empresa.endereco,
        empresa.cidade,
        empresa.pais,
        empresa.foto,
        Number.parseInt(id),
      ]
    );

    await connection.end();

    return editedRows;
  }
}

module.exports = Empresa, upload;
