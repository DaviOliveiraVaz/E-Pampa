var express = require ("express");
var app = express();
var path = require("path");
const ejs = require('ejs');

app.get('/', function(req, res){
    res.render("index.ejs", {});
});

app.get('/login', function(req, res){
    res.render("login.ejs", {});
});

app.get('/produtos', function(req, res){
    res.render("produtos.ejs", {});
});

app.listen('3000', function(){
    console.log("Conexão iniciada com sucesso!");
});