require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// ========== CONFIGURAÇÕES ==========
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ========== MIDDLEWARES ==========
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'seu-super-secret-key',
  resave: false,
  saveUninitialized: true
}));

// ========== ROTAS ==========
// Adicionando uma camada de segurança (Senha para entrar no site)
app.use((req, res, next) => {
  // Pega o usuário e senha do .env, ou usa 'amor' e '1234' como padrão
  const user = process.env.SITE_USER || 'amor';
  const pass = process.env.SITE_PASSWORD || '1234';

  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login && password && login === user && password === pass) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Nosso Lugar Secreto"');
  res.status(401).send('Acesso Negado. Este é um local privado! ❤️');
});

const rotasPrincipal = require('./routes/principal');
const rotasCartas = require('./routes/cartas');

app.use('/', rotasPrincipal);
app.use('/cartas', rotasCartas);

// ========== TRATAMENTO DE ERROS ==========
app.use((req, res) => {
  res.status(404).render('404', { title: 'Página não encontrada' });
});

// ========== INICIA SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎁 Servidor rodando em http://localhost:${PORT}`);
  console.log('Aperte Ctrl+C para parar');
});

