const express = require("express");
const app = express();
var path = require("path");
const ejs = require("ejs");
const fs = require("fs");
const mysql = require("mysql2/promise");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const bodyParser = require("body-parser");
const connection = require("./config/database.js");
const session = require("express-session");
const bcrypt = require("bcrypt");
const Empresa = require("./model/Empresa");
const Usuario = require("./model/Usuario");
const Produto = require("./model/Produto");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "lanche_do_mrbroa_eh_bom_demais",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", function (req, res) {
  res.render("tipo_login.ejs", {});
});

app.get("/login", function (req, res) {
  res.render("login_usuario.ejs");
});

app.get("/perfil", async (req, res) => {
  if (req.session.id_usuario) {
    const id = req.session.id_usuario;
    const usuarioExistente = await Usuario.buscarPorId(id);
    if (!(usuarioExistente.length && usuarioExistente.length)) {
      return res.status(404).json({ mensagem: "Cadastro não encontrado." });
    }
    const foto = usuarioExistente[0].foto
      ? Buffer.from(usuarioExistente[0].foto).toString("base64")
      : null;

    res.render("perfil.ejs", {
      usuario: {
        ...usuarioExistente[0],
        foto: foto,
      },
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/sair", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Erro ao encerrar a sessão: ", error);
      res.sendStatus(500);
      return;
    }
    res.redirect("/login");
  });
});

app.get("/loginEmpresa", function (req, res) {
  res.render("login_empresa.ejs", {});
});

app.get("/perfilEmpresarial", async (req, res) => {
  if (req.session.id_empresa) {
    const id = req.session.id_empresa;
    const empresaExistente = await Empresa.buscarPorId(id);
    if (!(empresaExistente.length && empresaExistente.length)) {
      return res.status(404).json({ mensagem: "Cadastro não encontrado." });
    }

    const foto = empresaExistente[0].foto
      ? Buffer.from(empresaExistente[0].foto).toString("base64")
      : null;

    res.render("perfil_empresarial.ejs", {
      empresa: {
        ...empresaExistente[0],
        foto: foto,
      },
    });
  } else {
    res.redirect("/loginEmpresa");
  }
});

app.get("/sairEmpresa", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Erro ao encerrar a sessão: ", error);
      res.sendStatus(500);
      return;
    }
    res.redirect("/loginEmpresa");
  });
});

app.get("/redefinir", function (req, res) {
  res.render("redefinicao.ejs", {});
});

app.get("/cadastro", function (req, res) {
  res.render("cadastro.ejs", {});
});

app.get("/excluirUsuario/:id", async (req, res) => {
  const id = req.params.id;
  const usuarioExistente = await Usuario.buscarPorId(id);
  if (!(usuarioExistente && usuarioExistente.length)) {
    return res.status(404).send("Usuário não encontrado!");
  }
  const deletedRows = await Usuario.excluir(id);
  res.redirect(`/login`);
});

app.get("/empresa", function (req, res) {
  res.render("empresa.ejs", {});
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

app.get("/excluirProduto/:id", async (req, res) => {
  const id = req.params.id;
  const produtoExistente = await Produto.buscarPorId(id);
  if (!produtoExistente.length && produtoExistente.length) {
    return res.status(404).send("Produto não encontrado!");
  }
  const deletedRows = await Produto.excluir(id);
  res.redirect("/meusProdutos");
});

app.get("/produtos", async (req, res) => {
  try {
    const id_empresa = req.session.id_empresa;
    const id_usuario = req.session.id_usuario;
    const produto = new Produto();

    if (!id_empresa && !id_usuario) {
      return res.redirect("/login");
    }

    if (id_empresa) {
      const empresaExistente = await Empresa.buscarPorId(id_empresa);

      if (!empresaExistente || empresaExistente.length === 0) {
        return res.status(404).send("Empresa não encontrada.");
      }

      const foto = empresaExistente[0]?.foto
        ? Buffer.from(empresaExistente[0].foto).toString("base64")
        : null;
      let dados = await produto.findAll();
      dados = dados.map(function (produto) {
        produto.foto = Buffer.from(produto.foto).toString("base64");
        return produto;
      });

      return res.render("produtos.ejs", {
        dados: dados,
        session: req.session,
        empresa: {
          ...empresaExistente[0],
          foto: foto,
        },
      });
    }

    if (id_usuario) {
      const usuario = await Usuario.buscarPorId(id_usuario);
      if (!usuario || usuario.length === 0) {
        return res.status(404).send("Usuário não encontrado.");
      }

      let dados = await produto.findAll();
      dados = dados.map(function (produto) {
        produto.foto = Buffer.from(produto.foto).toString("base64");
        return produto;
      });

      return res.render("produtos.ejs", {
        dados: dados,
        session: req.session,
        usuario: {
          ...usuario[0],
          foto: usuario[0]?.foto
            ? Buffer.from(usuario[0].foto).toString("base64")
            : null,
        },
      });
    }
  } catch (error) {
    res.status(500).send("Ocorreu um erro: " + error);
  }
});

app.get("/meusProdutos", async (req, res) => {
  try {
    const id_empresa = req.session.id_empresa;
    const id_usuario = req.session.id_usuario;
    if (!id_empresa && !id_usuario) {
      return res.redirect("/loginEmpresa");
    }
    const id = req.session.id_empresa;
    const produto = new Produto();
    const empresaExistente = await Empresa.buscarPorId(id);
    const foto = Buffer.from(empresaExistente[0].foto).toString("base64");
    let dados = await produto.meusProdutos(id);
    dados = dados.map(function (produto) {
      produto.foto = Buffer.from(produto.foto).toString("base64");
      return produto;
    });
    res.render("meusProdutos.ejs", {
      dados: dados,
      session: req.session,
      empresa: {
        ...empresaExistente[0],
        foto: foto,
      },
    });
  } catch (error) {
    res.status(500).send("Ocorreu um erro: " + error);
  }
});

app.get("/editarProduto/:id", async (req, res) => {
  try {
    const id_empresa = req.session.id_empresa;
    const id_usuario = req.session.id_usuario;
    if (!id_empresa && !id_usuario) {
      return res.redirect("/loginEmpresa");
    }
    const id = req.params.id;
    const produto = await Produto.obterProduto(id);
    res.render("editarProduto.ejs", { produto: produto });
  } catch (error) {
    res.status(500).send("Ocorreu um erro: " + error);
  }
});

app.get("/favoritos", async (req, res) => {
  try {
    const id_empresa = req.session.id_empresa;
    const id_usuario = req.session.id_usuario;
    const produto = new Produto();

    if (!id_empresa && !id_usuario) {
      return res.redirect("/login");
    }

    if (id_empresa) {
      const empresaExistente = await Empresa.buscarPorId(id_empresa);

      if (!empresaExistente || empresaExistente.length === 0) {
        return res.status(404).send("Empresa não encontrada.");
      }

      const foto = empresaExistente[0]?.foto
        ? Buffer.from(empresaExistente[0].foto).toString("base64")
        : null;
      let dados = await produto.findAll();
      dados = dados.map(function (produto) {
        produto.foto = Buffer.from(produto.foto).toString("base64");
        return produto;
      });

      return res.render("favoritos.ejs", {
        dados: dados,
        session: req.session,
        empresa: {
          ...empresaExistente[0],
          foto: foto,
        },
      });
    }

    if (id_usuario) {
      const usuario = await Usuario.buscarPorId(id_usuario);
      if (!usuario || usuario.length === 0) {
        return res.status(404).send("Usuário não encontrado.");
      }

      let dados = await produto.findAll();
      dados = dados.map(function (produto) {
        produto.foto = Buffer.from(produto.foto).toString("base64");
        return produto;
      });

      return res.render("favoritos.ejs", {
        dados: dados,
        session: req.session,
        usuario: {
          ...usuario[0],
          foto: usuario[0]?.foto
            ? Buffer.from(usuario[0].foto).toString("base64")
            : null,
        },
      });
    }
  } catch (error) {
    res.status(500).send("Ocorreu um erro: " + error);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;
  const query = "SELECT * FROM usuario WHERE email = ?";
  connection.query(query, [email], async (error, results) => {
    if (error) {
      console.error("Erro ao consultar o banco de dados: ", error);
      res
        .status(500)
        .send(
          `<script>alert("Ocorreu um erro ao consultar o banco de dados."); window.history.back();</script>`
        );
      return;
    }

    if (results.length === 0) {
      res.send(
        `<script>alert("Cadastro não encontrado."); window.history.back();</script>`
      );
      return;
    }

    const senhaHash = results[0].senha;
    const senhaCorreta = await bcrypt.compare(senha, senhaHash);

    if (senhaCorreta) {
      req.session.id_usuario = results[0].id;
      req.session.email = results[0].email;
      res.redirect("/perfil");
    } else {
      res.send(
        `<script>alert("E-mail ou senha incorretos."); window.history.back();</script>`
      );
    }
  });
});

app.post("/sair", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Erro ao encerrar a sessão: ", error);
      res.sendStatus(500);
      return;
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

app.post("/loginEmpresa", (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;
  const query = "SELECT * FROM empresa WHERE email = ?";
  connection.query(query, [email], async (error, results) => {
    if (error) {
      console.error("Erro ao consultar o banco de dados: ", error);
      res.send(
        `<script>alert("Ocorreu um erro ao consultar o banco de dados."); window.history.back();</script>`
      );
      return;
    }

    if (results.length === 0) {
      res.send(
        `<script>alert("Cadastro não encontrado."); window.history.back();</script>`
      );
      return;
    }

    const senhaHash = results[0].senha;
    const senhaCorreta = await bcrypt.compare(senha, senhaHash);

    if (senhaCorreta) {
      req.session.id_empresa = results[0].id;
      req.session.email = results[0].email;
      res.redirect("/perfilEmpresarial");
    } else {
      res.send(
        `<script>alert("E-mail ou senha incorretos."); window.history.back();</script>`
      );
    }
  });
});

app.post("/sairEmpresa", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Erro ao encerrar a sessão: ", error);
      res.sendStatus(500);
      return;
    }
    res.redirect("/loginEmpresa");
  });
});

app.post("/cadastro", async (req, res) => {
  const { nome, cpf, endereco, email, senha, telefone, cidade, pais } =
    req.body;
  const usuario = new Usuario(
    nome,
    cpf,
    endereco,
    email,
    senha,
    telefone,
    cidade,
    pais
  );

  try {
    const idInserido = await usuario.adicionar();
    const mensagem = "Usuário cadastrado com sucesso!";
    res.send(
      `<script>alert("${mensagem}"); window.location.href = "/login";</script>`
    );
  } catch (error) {
    let mensagem = "Erro ao cadastrar usuário.";
    if (error.message.includes("E-mail já utilizado")) {
      mensagem = `${mensagem} E-mail já utilizado!`;
    }
    res.send(`<script>alert("${mensagem}"); window.history.back();</script>`);
  }
});

app.post("/editarUsuario/:id", async (req, res) => {
  const id = req.params.id;
  const { nome, cpf, endereco, email, senha, telefone, cidade, pais, sobre } =
    req.body;
  const usuario = new Usuario(
    nome,
    cpf,
    endereco,
    email,
    senha,
    telefone,
    cidade,
    pais,
    sobre
  );
  const editedROws = await Usuario.editar(id, usuario);
  res.redirect(`/perfil`);
});

app.post("/editarFotoUsuario/:id", upload.single("foto"), async (req, res) => {
  const id = req.params.id;
  const fotoPath = req.file ? req.file.path : null;

  if (fotoPath) {
    const fotoData = fs.readFileSync(fotoPath);
    const editedRows = await Usuario.editarFoto(id, fotoData);
    fs.unlinkSync(fotoPath);
  }
  res.redirect(`/perfil`);
});

app.post("/empresa", async (req, res) => {
  const { nome, cnpj, ramo, email, senha, telefone, endereco, cidade, pais } =
    req.body;
  const empresa = new Empresa(
    nome,
    cnpj,
    ramo,
    email,
    senha,
    telefone,
    endereco,
    cidade,
    pais
  );

  try {
    const idInserido = await empresa.adicionar();
    const mensagem = "Empresa cadastrado com sucesso!";
    res.send(
      `<script>alert("${mensagem}"); window.location.href = "/loginEmpresa";</script>`
    );
  } catch (error) {
    let mensagem = "Erro ao cadastrar empresa.";
    if (error.message.includes("E-mail já utilizado")) {
      mensagem = `${mensagem} E-mail já utilizado!`;
    }
    res.send(`<script>alert("${mensagem}"); window.history.back();</script>`);
  }
});

app.post("/editarEmpresa/:id", async (req, res) => {
  const id = req.params.id;
  const {
    nome,
    cnpj,
    ramo,
    email,
    senha,
    telefone,
    descricao,
    endereco,
    cidade,
    pais,
  } = req.body;
  const empresa = new Empresa(
    nome,
    cnpj,
    ramo,
    email,
    senha,
    telefone,
    descricao,
    endereco,
    cidade,
    pais
  );
  const editedROws = await Empresa.editar(id, empresa);
  res.redirect(`/perfilEmpresarial`);
});

app.post("/editarFotoEmpresa/:id", upload.single("foto"), async (req, res) => {
  const id = req.params.id;
  const fotoPath = req.file ? req.file.path : null;

  if (fotoPath) {
    const fotoData = fs.readFileSync(fotoPath);
    const editedRows = await Empresa.editarFoto(id, fotoData);
    fs.unlinkSync(fotoPath);
  }
  res.redirect(`/perfilEmpresarial`);
});

app.post("/produto", upload.single("foto"), async (req, res) => {
  const { nome, valor, descricao, empresa, frete } = req.body;

  const fotoPath = req.file ? req.file.path : null;
  let fotoData = null;
  if (fotoPath) {
    fotoData = fs.readFileSync(fotoPath);
    fs.unlinkSync(fotoPath);
  }
  const produto = new Produto(nome, valor, descricao, empresa, frete, fotoData);
  const idInserido = await produto.adicionar();
  res.redirect(`/perfilEmpresarial`);
});

app.post("/editarProduto/:id", upload.single("foto"), async (req, res) => {
  try {
    const id = req.params.id;
    const fotoPath = req.file ? req.file.path : null;
    const { nome, valor, descricao, empresa_id, frete } = req.body;
    const produto = new Produto(nome, valor, descricao, empresa_id, frete);

    if (fotoPath) {
      const fotoData = fs.readFileSync(fotoPath);
      produto.foto = fotoData;
      fs.unlinkSync(fotoPath);
    }

    const editedRows = await Produto.editar(id, produto);

    res.redirect("/meusProdutos");
  } catch (error) {
    res.status(500).send("Ocorreu um erro: " + error);
  }
});

app.listen("3000", function () {
  console.log("Conexão iniciada com sucesso!");
});
