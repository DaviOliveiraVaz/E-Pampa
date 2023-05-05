const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
class Empresa {
  constructor(nome, cnpj, ramo, email, senha, telefone) {
    this.nome = nome;
    this.cnpj = cnpj;
    this.ramo = ramo;
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
      "INSERT INTO empresa (nome, cnpj, ramo, email, senha, telefone) VALUES (?, ?, ?, ?, ?, ?)",
      [this.nome, this.cnpj, this.ramo, this.email, this.senha, this.telefone]
    );

    await connection.end();

    return rows.insertId;
  }
}

module.exports = Empresa;