const express = require("express");
const app = express();
var path = require("path");
const ejs = require("ejs");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const connection = require("./config/database.js");
const Empresa = require("./model/Empresa");
const Usuario = require("./model/Usuario");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.render("index.ejs", {});
});

app.get("/cadastro", function (req, res) {
  res.render("cadastro.ejs", {});
});

app.get("/editarUsuario/:id", async (req, res) => {
  const id = req.params.id;
  const usuarioExistente = await Usuario.buscarPorId(id);
  if (!(usuarioExistente.length && usuarioExistente.length)) {
    return res.status(404).render("naoEncontrado.ejs");
  }
  res.render("editarUsuario.ejs", { usuario: usuarioExistente[0] });
});

app.get("/excluirUsuario/:id", async (req, res) => {
  const id = req.params.id;
  const usuarioExistente = await Usuario.buscarPorId(id);
  if (!(usuarioExistente && usuarioExistente.length)) {
    return res.status(404).send("Usuário não encontrado!");
  }
  const deletedRows = await Usuario.excluir(id);
  res.send(`Usuario excluído com sucesso. ID: ${id}`);
});

app.get("/empresa", function (req, res) {
  res.render("empresa.ejs", {});
});

app.get("/editarEmpresa/:id", async (req, res) => {
  const id = req.params.id;
  const empresaExistente = await Empresa.buscarPorId(id);
  if (!(empresaExistente && empresaExistente.length)) {
    return res.status(404).render("naoEncontrado.ejs");
  }
  res.render("editarEmpresa.ejs", { empresa: empresaExistente[0] });
});

app.get("/excluirEmpresa/:id", async (req, res) => {
  const id = req.params.id;
  const empresaExistente = await Empresa.buscarPorId(id);
  if (!empresaExistente.length && empresaExistente.length) {
    return res.status(404).send("Empresa não encontrada!");
  }
  const deletedRows = await Empresa.excluir(id);
  res.send(`Empresa excluída com sucesso. ID: ${id}`);
});

app.post("/cadastro", async (req, res) => {
  const { nome, cpf, endereco, email, senha, telefone } = req.body;
  const usuario = new Usuario(nome, cpf, endereco, email, senha, telefone);
  const idInserido = await usuario.adicionar();
  res.send(`Usuário cadastrado com sucesso. ID: ${idInserido}`);
});

app.post("/editarUsuario/:id", async (req, res) => {
  const id = req.params.id;
  const { nome, cpf, endereco, email, senha, telefone } = req.body;
  const usuario = new Usuario(nome, cpf, endereco, email, senha, telefone);
  const editedROws = await Usuario.editar(id, usuario);
  res.send(
    `Usuário editado com sucesso. ID: ${id}`
  );
});

app.post("/empresa", async (req, res) => {
  const { nome, cnpj, ramo, email, senha, telefone } = req.body;
  const empresa = new Empresa(nome, cnpj, ramo, email, senha, telefone);
  const idInserido = await empresa.adicionar();
  res.send(`Empresa cadastrada com sucesso. ID: ${idInserido}`);
});

app.post("/editarEmpresa/:id", async (req, res) => {
  const id = req.params.id;
  const { nome, cnpj, ramo, email, senha, telefone } = req.body;
  const empresa = new Empresa(nome, cnpj, ramo, email, senha, telefone);
  const editedROws = await Empresa.editar(id, empresa);
  res.send(
    `Empresa editada com sucesso. ID: ${id}`
  );
});

app.listen("3000", function () {
  console.log("Conexão iniciada com sucesso!");
});
