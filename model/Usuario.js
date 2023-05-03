const mysql = require("mysql2/promise");

class Usuario {
  constructor(nome, cpf, endereco, email, senha) {
    this.nome = nome;
    this.cnpj = cpf;
    this.ramo = endereco;
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
      "INSERT INTO usuario (nome, cpf, endereco, email, senha) VALUES (?, ?, ?, ?, ?)",
      [this.nome, this.cpf, this.endereco, this.email, this.senha]
    );

    await connection.end();

    return rows.insertId;
  }
}

module.exports = Usuario;