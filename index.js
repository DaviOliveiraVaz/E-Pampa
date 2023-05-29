const express = require("express");
const app = express();
var path = require("path");
const ejs = require("ejs");
const mysql = require("mysql2/promise");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const bodyParser = require("body-parser");
const connection = require("./config/database.js");
const session = require('express-session');
const bcrypt = require('bcrypt');
const Empresa = require("./model/Empresa");
const Usuario = require("./model/Usuario");
const Produto = require("./model/Produto");

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: 'lanche_do_mrbroa_eh_bom_demais',
  resave: false,
  saveUninitialized: true
}));

app.get("/", function (req, res) {
  res.render("login_usuario.ejs", {});
});

app.get("/loginEmpresa", function (req, res) {
  res.render("login_empresa.ejs", {});
});

app.get('/perfil', (req, res) => {
  if (req.session.id_usuario) {
    res.send('Bem-vindo ao seu perfil, ' + req.session.email);
  } else {
    res.redirect('/');
  }
});

app.get('/perfilEmpresarial', (req, res) => {
  if (req.session.id_empresa) {
    res.send('Bem-vindo ao seu perfil, ' + req.session.email);
  } else {
    res.redirect('/loginEmpresa');
  }
});

app.get("/loja", function (req, res) {
  res.render("index.ejs", {});
});

app.get("/redefinir", function (req, res) {
  res.render("redefinicao.ejs", {});
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

app.get("/produto", function (req, res) {
  res.render("produto.ejs", {});
});

app.get("/editarProduto/:id", async (req, res) => {
  const id = req.params.id;
  const produtoExistente = await Produto.buscarPorId(id);
  if (!(produtoExistente && produtoExistente.length)) {
    return res.status(404).render("naoEncontrado.ejs");
  }
  res.render("editarProduto.ejs", { produto: produtoExistente[0] });
});

app.get("/excluirProduto/:id", async (req, res) => {
  const id = req.params.id;
  const produtoExistente = await Produto.buscarPorId(id);
  if (!produtoExistente.length && produtoExistente.length) {
    return res.status(404).send("Produto não encontrado!");
  }
  const deletedRows = await Produto.excluir(id);
  res.send(`Produto excluído com sucesso. ID: ${id}`);
});

app.post('/', (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;
  const query = 'SELECT * FROM usuario WHERE email = ?';
  connection.query(query, [email], async (error, results) => {
    if (error) {
      console.error('Erro ao consultar o banco de dados: ', error);
      res.sendStatus(500);
      return;
    }
    if (results.length > 0) {
      const senhaHash = results[0].senha;
      const senhaCorreta = await bcrypt.compare(senha, senhaHash);
      if (senhaCorreta) {
        req.session.id_usuario = results[0].id;
        req.session.email = results[0].email;
        res.redirect('/perfil');
      } else {
        res.render('naoEncontrado.ejs');
      }
    } else {
      res.render('naoEncontrado.ejs');
    }
  });
});

app.post('/loginEmpresa', (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;
  const query = 'SELECT * FROM empresa WHERE email = ?';
  connection.query(query, [email], async (error, results) => {
    if (error) {
      console.error('Erro ao consultar o banco de dados: ', error);
      res.sendStatus(500);
      return;
    }
    if (results.length > 0) {
      const senhaHash = results[0].senha;
      const senhaCorreta = await bcrypt.compare(senha, senhaHash);
      if (senhaCorreta) {
        req.session.id_empresa = results[0].id;
        req.session.email = results[0].email;
        res.redirect('/perfilEmpresarial');
      } else {
        res.render('naoEncontrado.ejs');
      }
    } else {
      res.render('naoEncontrado.ejs');
    }
  });
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
  res.send(`Usuário editado com sucesso. ID: ${id}`);
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
  res.send(`Empresa editada com sucesso. ID: ${id}`);
});

app.post("/produto", upload.single("foto"), async (req, res) => {
  const { nome, valor, descricao, empresa, frete } = req.body;
  const foto = req.file ? req.file.path : null;
  const produto = new Produto(nome, valor, descricao, empresa, frete, foto);
  const idInserido = await produto.adicionar();
  res.send(`Produto cadastrado com sucesso. ID: ${idInserido}`);
});

app.post("/editarProduto/:id", upload.single("foto"), async (req, res) => {
  const id = req.params.id;
  const { nome, valor, descricao, empresa, frete } = req.body;
  const foto = req.file ? req.file.path : null;
  const produto = new Produto(nome, valor, descricao, empresa, frete, foto);
  const editedROws = await Produto.editar(id, produto);
  res.send(`Produto editado com sucesso. ID: ${id}`);
});

app.listen("3000", function () {
  console.log("Conexão iniciada com sucesso!");
});
