const mysql = require("mysql2/promise");

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
      [this.nome, this.cpf, this.endereco, this.email, this.senha, this.telefone]
    );

    await connection.end();

    return rows.insertId;
  }
}

module.exports = Usuario;