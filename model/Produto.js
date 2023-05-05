const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
class Produto {
  constructor(nome, valor, descricao, empresa) {
    this.nome = nome;
    this.valor = valor;
    this.descricao = descricao;
    this.empresa = empresa;
  }

  async adicionar() {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const [rows, fields] = await connection.execute(
      "INSERT INTO produto (nome, valor, descricao, empresa) VALUES (?, ?, ?, ?)",
      [this.nome, this.valor, this.descricao, this.empresa]
    );

    await connection.end();

    return rows.insertId;
  }
}

module.exports = Produto;