// =====================================================
// routes/jogos.js
// Rotas do módulo de Jogos
// =====================================================

const express = require('express');
const router  = express.Router();
const jogosController = require('../controllers/jogosController');

// Hub de jogos
router.get('/', jogosController.getJogos);

// Batalha Naval
router.get('/batalha-naval', jogosController.getBatalhaNaval);

module.exports = router;
