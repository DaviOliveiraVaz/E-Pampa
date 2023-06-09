const mysql = require("mysql2/promise");
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
class Produto {
  constructor(nome, valor, descricao, empresa, frete, foto) {
    this.nome = nome;
    this.valor = valor;
    this.descricao = descricao;
    this.empresa = empresa;
    this.frete = frete;
    this.foto = foto;
  }

  async adicionar() {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const valores = [
      this.nome,
      this.valor,
      this.descricao,
      this.empresa,
      this.frete,
      this.foto,
    ].map((valor) => (typeof valor !== "undefined" ? valor : null));

    const [rows, fields] = await connection.execute(
      "INSERT INTO produto (nome, valor, descricao, empresa_id, frete, foto) VALUES (?, ?, ?, ?, ?, ?)",
      valores
    );

    await connection.end();

    return rows.insertId;
  }

  static async editar(id, produto) {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    let editedRows;

    if (produto.foto) {
      const [insertedRows, insertedFields] = await connection.execute(
        "UPDATE produto SET nome=?, valor=?, descricao=?, empresa_id=?, frete=?, foto=? WHERE id=?",
        [
          produto.nome,
          produto.valor,
          produto.descricao,
          produto.empresa,
          produto.frete,
          produto.foto,
          Number.parseInt(id),
        ]
      );

      editedRows = insertedRows;
    } else {
      const [updatedRows, updatedFields] = await connection.execute(
        "UPDATE produto SET nome=?, valor=?, descricao=?, empresa_id=?, frete=? WHERE id=?",
        [
          produto.nome,
          produto.valor,
          produto.descricao,
          produto.empresa,
          produto.frete,
          Number.parseInt(id),
        ]
      );

      editedRows = updatedRows;
    }

    await connection.end();

    return editedRows;
  }

  static async excluir(id) {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const [deletedRows, deletedFields] = await connection.execute(
      "DELETE FROM produto WHERE id = ?",
      [id]
    );

    await connection.end();

    return deletedRows;
  }

  static async buscarPorId(id) {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const [rows, fields] = await connection.execute(
      "SELECT id FROM produto WHERE id = ?",
      [id]
    );

    await connection.end();

    return rows;
  }

  async findAll() {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const [rows, fields] = await connection.execute(
      "SELECT * FROM produto",
    );

    await connection.end();

    return rows;
  }

  async meusProdutos(id) {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const [rows, fields] = await connection.execute(
      "SELECT * FROM produto where empresa_id = ?",
      [id]
    );

    await connection.end();

    return rows;
  }

  static async obterProduto(id) {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });
  
    const [rows, fields] = await connection.execute(
      "SELECT * FROM produto WHERE id = ?",
      [id]
    );
  
    await connection.end();
  
    // Verifica se foi encontrado um produto com o ID fornecido
    if (rows.length === 0) {
      throw new Error("Produto não encontrado.");
    }
  
    return rows[0]; // Retorna o primeiro resultado encontrado
  }
}

module.exports = Produto, upload;
