// =====================================================
// routes/jogos.js
// Rotas do módulo de Jogos
// =====================================================

const express = require('express');
const router  = express.Router();
const jogosController = require('../controllers/jogosController');

// Hub de jogos
router.get('/', jogosController.getJogos);

// Batalha Naval (Online)
router.get('/batalha-naval', jogosController.getBatalhaNaval);

// Batalha Naval (Local / Mesmo Celular)
router.get('/batalha-naval-local', jogosController.getBatalhaNavalLocal);

// Salvar Estatísticas Local
router.post('/api/salvar-estatistica', jogosController.salvarEstatisticaLocal);

module.exports = router;
