const express = require ("express");
const app = express();
var path = require("path");
const ejs = require('ejs');
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const connection = require("./config/database.js");
const Empresa = require("./model/Empresa");
const Usuario = require("./model/Usuario");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res){
    res.render("index.ejs", {});
});

app.get('/cadastro', function(req, res){
    res.render("cadastro.ejs", {});
});

app.get('/empresa', function(req, res){
    res.render("empresa.ejs", {});
});

app.post("/cadastro", async (req, res) => {
    const { nome, cpf, endereco, email, senha, telefone } = req.body;
    const usuario = new Usuario(nome, cpf, endereco, email, senha, telefone);
    const idInserido = await usuario.adicionar();
    res.send(`Usuário cadastrado com sucesso. ID: ${idInserido}`);
    res.redirect("/");
  });

app.post("/empresa", async (req, res) => {
    const { nome, cnpj, ramo, email, senha, telefone } = req.body;
    const empresa = new Empresa(nome, cnpj, ramo, email, senha, telefone);
    const idInserido = await empresa.adicionar();
    res.send(`Empresa cadastrada com sucesso. ID: ${idInserido}`);
    res.redirect("/");
  });

app.listen('3000', function(){
    console.log("Conexão iniciada com sucesso!");
});