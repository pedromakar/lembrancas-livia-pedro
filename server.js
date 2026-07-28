require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');
const bodyParser = require('body-parser');
const session    = require('express-session');

const app    = express();
const server = http.createServer(app);  // Servidor HTTP nativo (necessário para Socket.io)
const io     = new Server(server);      // Socket.io montado no mesmo servidor

// ========== CONFIGURAÇÕES ==========
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ========== MIDDLEWARES ==========
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'seu-super-secret-key',
  resave: false,
  saveUninitialized: true
}));

// ========== SEGURANÇA — Senha de acesso ao site ==========
app.use((req, res, next) => {
  const user = process.env.SITE_USER || 'pedro';
  const pass = process.env.SITE_PASSWORD || '12345';

  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login && password && login === user && password === pass) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Nosso Lugar Secreto"');
  res.status(401).send('Acesso Negado. Este é um local privado! ❤️');
});

// ========== ROTAS ==========
const rotasPrincipal = require('./routes/principal');
const rotasCartas    = require('./routes/cartas');
const rotasJogos     = require('./routes/jogos');

app.use('/', rotasPrincipal);
app.use('/cartas', rotasCartas);
app.use('/jogos', rotasJogos);

// ========== GAME ENGINE — Socket.io ==========
const batalhaNaval = require('./game-engine/batalha-naval');
batalhaNaval.inicializar(io);

// ========== TRATAMENTO DE ERROS ==========
app.use((req, res) => {
  res.status(404).render('404', { title: 'Página não encontrada' });
});

// ========== INICIA SERVIDOR ==========
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🎁 Servidor rodando em http://localhost:${PORT}`);
  console.log('🎮 Socket.io ativo para Batalha Naval');
  console.log('Aperte Ctrl+C para parar');
});

