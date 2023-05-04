var express = require ("express");
var app = express();
var path = require("path");
const ejs = require('ejs');
const connection = require("./config/database.js");
const Empresa = require("./model/Empresa");
const Usuario = require("./model/Usuario");

app.get('/', function(req, res){
    res.render("index.ejs", {});
});

app.get('/login', function(req, res){
    res.render("login.ejs", {});
});

app.post('/login', function(req, res){
    var usuario = new Usuario({
        nome: req.body.nome,
        cpf: req.body.cpf,
        endereco: req.body.endereco,
        email: req.body.email,
        senha: req.body.senha,
        telefone: req.body.telefone
    });

    usuario.save(function(err, docs){
        if(err){
            res.send("Deu o seguinte erro ao cadastrar o usuário: " + err);
        } else{
            res.redirect("/usuarios");
        }
    });
});

app.get('/produtos', function(req, res){
    res.render("produtos.ejs", {});
});

app.listen('3000', function(){
    console.log("Conexão iniciada com sucesso!");
});