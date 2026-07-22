const express = require('express');
const router  = express.Router();
const principalController = require('../controllers/principalController');

// Página inicial
router.get('/', principalController.getPrincipal);

// Contador de tempo (API)
router.get('/tempo', principalController.getTempo);

// API - Lembrança aleatória (botão "Me surpreenda")
router.get('/api/lembranca-aleatoria', principalController.getLembrancaAleatoria);

// Playlist
router.get('/playlist', principalController.getPlaylist);
router.post('/playlist/criar',        principalController.criarMusica);
router.post('/playlist/editar/:id',   principalController.editarMusica);
router.post('/playlist/deletar/:id',  principalController.deletarMusica);

// Lembranças
router.get('/lembrancas', principalController.getLembrancas);
router.post('/lembrancas/criar',            principalController.criarLembranca);
router.post('/lembrancas/editar/:id',       principalController.editarLembranca);
router.post('/lembrancas/deletar/:id',      principalController.deletarLembranca);
router.post('/api/lembrancas/favoritar/:id', principalController.toggleFavoritoLembranca);

// Nossa História
router.get('/historia', principalController.getHistoria);
router.post('/historia/criar',       principalController.criarEvento);
router.post('/historia/editar/:id',  principalController.editarEvento);
router.post('/historia/deletar/:id', principalController.deletarEvento);

// Lugares
router.get('/lugares', principalController.getLugares);
router.post('/lugares/criar',       principalController.criarLugar);
router.post('/lugares/editar/:id',  principalController.editarLugar);
router.post('/lugares/deletar/:id', principalController.deletarLugar);

// Estatísticas
router.get('/estatisticas', principalController.getEstatisticas);

module.exports = router;
