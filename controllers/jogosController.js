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

// ---- Batalha Naval (Online) (/jogos/batalha-naval) ----
exports.getBatalhaNaval = (req, res) => {
    const stats = jogosService.lerEstatisticas();
    res.render('jogos/batalha-naval', {
        title: 'Batalha Naval',
        resumo: stats.resumo,
    });
};

// ---- Batalha Naval (Local / Mesmo Celular) ----
exports.getBatalhaNavalLocal = (req, res) => {
    const stats = jogosService.lerEstatisticas();
    res.render('jogos/batalha-naval-local', {
        title: 'Batalha Naval (Local)',
        resumo: stats.resumo,
    });
};

// ---- Salvar Estatística Local (API) ----
exports.salvarEstatisticaLocal = (req, res) => {
    try {
        const { vencedor, perdedor, tirosVencedor, tirosPerdedor, duracaoSegundos, melhorSequencia } = req.body;
        if (!vencedor || !perdedor) return res.status(400).json({ erro: 'Dados incompletos' });
        
        jogosService.registrarPartida({
            vencedor, perdedor, tirosVencedor, tirosPerdedor, duracaoSegundos, melhorSequencia
        });
        
        res.json({ sucesso: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro interno' });
    }
};
