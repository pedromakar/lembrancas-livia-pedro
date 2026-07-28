// =====================================================
// controllers/jogosController.js
// Renderiza as páginas do módulo de Jogos
// =====================================================

const jogosService = require('../services/jogosService');

// ---- Hub de Jogos (/jogos) ----
exports.getJogos = (req, res) => {
    const stats = jogosService.lerEstatisticas();
    res.render('jogos/index', {
        title: 'Jogos',
        resumo: stats.resumo,
        ultimasPartidas: stats.partidas.slice(0, 5),
    });
};

// ---- Batalha Naval (/jogos/batalha-naval) ----
exports.getBatalhaNaval = (req, res) => {
    const stats = jogosService.lerEstatisticas();
    res.render('jogos/batalha-naval', {
        title: 'Batalha Naval',
        resumo: stats.resumo,
    });
};
