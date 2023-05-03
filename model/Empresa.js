const mysql = require("mysql2/promise");

class Empresa {
  constructor(nome, cnpj, ramo, email, senha) {
    this.nome = nome;
    this.cnpj = cnpj;
    this.ramo = ramo;
    this.email = email;
    this.senha = senha;
  }

  async adicionar() {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "41491912",
      database: "epampa",
    });

    const [rows, fields] = await connection.execute(
      "INSERT INTO empresa (nome, cnpj, ramo, email, senha) VALUES (?, ?, ?, ?, ?)",
      [this.nome, this.cnpj, this.ramo, this.email, this.senha]
    );

    await connection.end();

    return rows.insertId;
  }
}

module.exports = Empresa;