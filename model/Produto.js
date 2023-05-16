const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const fs = require("fs");
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

    const fotoData = fs.readFileSync(this.foto);
    const fotoBase64 = fotoData.toString("base64");

    const [rows, fields] = await connection.execute(
      "INSERT INTO produto (nome, valor, descricao, empresa, frete, foto) VALUES (?, ?, ?, ?, ?, ?)",
      [
        this.nome,
        this.valor,
        this.descricao,
        this.empresa,
        this.frete,
        fotoBase64
      ]
    );

    await connection.end();

    return rows.insertId;
  }
}

module.exports = Produto;
