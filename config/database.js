const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "41491912",
  database: "epampa",
});

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados: " + err.stack);
    return;
  }

  console.log("Conexão bem-sucedida com o banco de dados.");
});

module.exports = connection;
