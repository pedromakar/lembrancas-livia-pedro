// =====================================================
// services/jogosService.js
// Gerencia leitura e escrita das estatísticas de jogos
// nos arquivos JSON locais da pasta data/
// =====================================================

const fs   = require('fs');
const path = require('path');

const STATS_PATH = path.join(__dirname, '../data/estatisticas-jogos.json');

// ---- Leitura ----
function lerEstatisticas() {
    try {
        const raw = fs.readFileSync(STATS_PATH, 'utf8');
        return JSON.parse(raw);
    } catch {
        return { partidas: [], resumo: { totalPartidas: 0, vitoriasPedro: 0, vitoriasLivia: 0, melhorSequenciaAcertos: { jogador: null, sequencia: 0 } } };
    }
}

// ---- Escrita ----
function salvarEstatisticas(dados) {
    fs.writeFileSync(STATS_PATH, JSON.stringify(dados, null, 2), 'utf8');
}

// ---- Registra uma nova partida finalizada ----
function registrarPartida({ vencedor, perdedor, tirosVencedor, tirosPerdedor, duracaoSegundos, melhorSequencia }) {
    const stats = lerEstatisticas();

    const partida = {
        id: Date.now(),
        data: new Date().toISOString(),
        vencedor,
        perdedor,
        tirosVencedor,
        tirosPerdedor,
        duracaoSegundos,
        melhorSequencia
    };

    stats.partidas.unshift(partida);           // Mais recente primeiro
    if (stats.partidas.length > 50) stats.partidas = stats.partidas.slice(0, 50); // Máximo 50 registros

    stats.resumo.totalPartidas++;
    if (vencedor === 'Pedro') stats.resumo.vitoriasPedro++;
    if (vencedor === 'Lívia') stats.resumo.vitoriasLivia++;

    // Atualiza melhor sequência
    if (melhorSequencia > stats.resumo.melhorSequenciaAcertos.sequencia) {
        stats.resumo.melhorSequenciaAcertos = { jogador: vencedor, sequencia: melhorSequencia };
    }

    salvarEstatisticas(stats);
    return stats;
}

module.exports = { lerEstatisticas, registrarPartida };
