// =====================================================
// game-engine/batalha-naval.js
// Motor do jogo Batalha Naval — lógica de servidor
// Gerencia salas, posicionamentos, tiros e vitória
// via Socket.io
// =====================================================

const jogosService = require('../services/jogosService');

// ---- Configuração dos navios ----
const NAVIOS_CONFIG = [
    { nome: 'Porta-aviões', tamanho: 5, quantidade: 1, icone: '<i class="fa-solid fa-ship" style="color: white;"></i>' },
    { nome: 'Cruzador',     tamanho: 4, quantidade: 1, icone: '<i class="fa-solid fa-anchor" style="color: white;"></i>' },
    { nome: 'Destroyer',    tamanho: 3, quantidade: 2, icone: '<i class="fa-solid fa-sailboat" style="color: white;"></i>' },
    { nome: 'Submarino',    tamanho: 2, quantidade: 2, icone: '<i class="fa-solid fa-water" style="color: white;"></i>' },
];

const TAMANHO_TABULEIRO = 10;

// ---- Estado global das salas ativas ----
// Map: codigoSala -> { jogadores, tabuleiros, estado, ... }
const salas = new Map();

// ---- Gera código de 4 letras maiúsculas ----
function gerarCodigo() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    // Garante código único
    if (salas.has(code)) return gerarCodigo();
    return code;
}

// ---- Cria tabuleiro vazio 10x10 ----
function criarTabuleiro() {
    return Array.from({ length: TAMANHO_TABULEIRO }, () =>
        Array.from({ length: TAMANHO_TABULEIRO }, () => ({ navio: null, atingido: false }))
    );
}

// ---- Valida se a posição dos navios está correta ----
function validarNavios(navios) {
    const tabuleiro = criarTabuleiro();
    let naviosValidos = {};

    // Conta quantos navios de cada tipo foram enviados
    for (const cfg of NAVIOS_CONFIG) {
        naviosValidos[cfg.tamanho] = naviosValidos[cfg.tamanho] || 0;
    }

    for (const navio of navios) {
        const { linha, coluna, tamanho, horizontal, id } = navio;

        // Verifica limites
        if (horizontal) {
            if (coluna + tamanho > TAMANHO_TABULEIRO) return { valido: false, erro: 'Navio fora dos limites' };
        } else {
            if (linha + tamanho > TAMANHO_TABULEIRO) return { valido: false, erro: 'Navio fora dos limites' };
        }

        // Verifica sobreposição
        for (let i = 0; i < tamanho; i++) {
            const l = horizontal ? linha : linha + i;
            const c = horizontal ? coluna + i : coluna;
            if (tabuleiro[l][c].navio !== null) return { valido: false, erro: 'Navios sobrepostos' };
            tabuleiro[l][c].navio = id;
        }
    }

    return { valido: true, tabuleiro };
}

// ---- Verifica se todos os navios de um jogador foram afundados ----
function verificarDerrota(tabuleiro, navios) {
    for (const navio of navios) {
        const { linha, coluna, tamanho, horizontal } = navio;
        let afundado = true;
        for (let i = 0; i < tamanho; i++) {
            const l = horizontal ? linha : linha + i;
            const c = horizontal ? coluna + i : coluna;
            if (!tabuleiro[l][c].atingido) { afundado = false; break; }
        }
        if (!afundado) return false;
    }
    return true;
}

// ---- Verifica se um navio específico foi afundado com o tiro atual ----
function navioAfundado(tabuleiro, navios, linhaAtual, colunaAtual) {
    for (const navio of navios) {
        const { linha, coluna, tamanho, horizontal } = navio;
        let pertence = false;
        for (let i = 0; i < tamanho; i++) {
            const l = horizontal ? linha : linha + i;
            const c = horizontal ? coluna + i : coluna;
            if (l === linhaAtual && c === colunaAtual) { pertence = true; break; }
        }
        if (!pertence) continue;

        // Verifica se todas as células do navio foram atingidas
        let todosAtingidos = true;
        for (let i = 0; i < tamanho; i++) {
            const l = horizontal ? linha : linha + i;
            const c = horizontal ? coluna + i : coluna;
            if (!tabuleiro[l][c].atingido) { todosAtingidos = false; break; }
        }
        if (todosAtingidos) return navio;
    }
    return null;
}

// ---- Registra todos os eventos Socket.io desta feature ----
function inicializar(io) {
    io.on('connection', (socket) => {
        console.log(`[Jogos] Conexão: ${socket.id}`);

        // ── Criar Sala ──────────────────────────────────────────
        socket.on('batalha:criar-sala', ({ nomeJogador }) => {
            const codigo = gerarCodigo();
            const sala = {
                codigo,
                jogadores: [{ id: socket.id, nome: nomeJogador, pronto: false }],
                tabuleiros: {},
                naviosPorJogador: {},
                turno: null,
                estado: 'aguardando',   // aguardando | posicionando | batalha | fim
                inicio: null,
                sequenciaAtual: { jogador: null, count: 0 },
                melhorSequencia: 0,
            };
            salas.set(codigo, sala);
            socket.join(codigo);
            socket.emit('batalha:sala-criada', { codigo, nomeJogador });
            console.log(`[Jogos] Sala ${codigo} criada por ${nomeJogador}`);
        });

        // ── Entrar na Sala ───────────────────────────────────────
        socket.on('batalha:entrar-sala', ({ codigo, nomeJogador }) => {
            const sala = salas.get(codigo);

            if (!sala) return socket.emit('batalha:erro', { msg: 'Sala não encontrada. Verifique o código!' });
            if (sala.jogadores.length >= 2) return socket.emit('batalha:erro', { msg: 'Essa sala já está cheia!' });
            if (sala.estado !== 'aguardando') return socket.emit('batalha:erro', { msg: 'Essa partida já começou.' });

            sala.jogadores.push({ id: socket.id, nome: nomeJogador, pronto: false });
            socket.join(codigo);

            // Avisa todos na sala
            io.to(codigo).emit('batalha:jogadores-prontos', {
                jogadores: sala.jogadores.map(j => ({ id: j.id, nome: j.nome })),
            });

            sala.estado = 'posicionando';
            io.to(codigo).emit('batalha:fase-posicionamento', { naviosConfig: NAVIOS_CONFIG });
            console.log(`[Jogos] ${nomeJogador} entrou na sala ${codigo}`);
        });

        // ── Navios Posicionados ──────────────────────────────────
        socket.on('batalha:navios-posicionados', ({ codigo, navios }) => {
            const sala = salas.get(codigo);
            if (!sala) return;

            const resultado = validarNavios(navios);
            if (!resultado.valido) return socket.emit('batalha:erro', { msg: resultado.erro });

            sala.tabuleiros[socket.id] = resultado.tabuleiro;
            sala.naviosPorJogador[socket.id] = navios;

            const jogador = sala.jogadores.find(j => j.id === socket.id);
            if (jogador) jogador.pronto = true;

            socket.emit('batalha:posicionamento-aceito');

            // Se ambos estão prontos, inicia a batalha
            const ambosPromtos = sala.jogadores.length === 2 && sala.jogadores.every(j => j.pronto);
            if (ambosPromtos) {
                sala.estado = 'batalha';
                sala.turno = sala.jogadores[0].id;  // Primeiro a entrar começa
                sala.inicio = Date.now();
                io.to(codigo).emit('batalha:inicio', {
                    turno: sala.turno,
                    jogadores: sala.jogadores.map(j => ({ id: j.id, nome: j.nome })),
                });
                console.log(`[Jogos] Batalha iniciada na sala ${codigo}`);
            }
        });

        // ── Atirar ──────────────────────────────────────────────
        socket.on('batalha:atirar', ({ codigo, linha, coluna }) => {
            const sala = salas.get(codigo);
            if (!sala || sala.estado !== 'batalha') return;
            if (sala.turno !== socket.id) return socket.emit('batalha:erro', { msg: 'Não é sua vez!' });

            // Identifica o adversário
            const adversario = sala.jogadores.find(j => j.id !== socket.id);
            if (!adversario) return;

            const tabAdversario = sala.tabuleiros[adversario.id];
            const celula = tabAdversario[linha][coluna];

            if (celula.atingido) return socket.emit('batalha:erro', { msg: 'Você já atirou aqui!' });

            celula.atingido = true;
            const acertou = celula.navio !== null;

            // Verifica se afundou algum navio
            let navioAfund = null;
            if (acertou) {
                navioAfund = navioAfundado(tabAdversario, sala.naviosPorJogador[adversario.id], linha, coluna);
            }

            // Atualiza sequência de acertos
            if (acertou) {
                if (sala.sequenciaAtual.jogador === socket.id) {
                    sala.sequenciaAtual.count++;
                } else {
                    sala.sequenciaAtual = { jogador: socket.id, count: 1 };
                }
                if (sala.sequenciaAtual.count > sala.melhorSequencia) {
                    sala.melhorSequencia = sala.sequenciaAtual.count;
                }
            } else {
                sala.sequenciaAtual = { jogador: null, count: 0 };
            }

            // Verifica derrota do adversário
            const fimDeJogo = verificarDerrota(tabAdversario, sala.naviosPorJogador[adversario.id]);

            const payload = {
                atirador: socket.id,
                linha, coluna,
                acertou,
                navioAfundado: navioAfund,
                proximo: fimDeJogo ? null : (acertou ? socket.id : adversario.id),
            };

            io.to(codigo).emit('batalha:resultado-tiro', payload);

            if (fimDeJogo) {
                sala.estado = 'fim';
                const duracaoSegundos = Math.floor((Date.now() - sala.inicio) / 1000);
                const vencedorObj = sala.jogadores.find(j => j.id === socket.id);
                const perdedorObj = adversario;

                // Conta tiros de cada um
                const tirosVencedor = sala.naviosPorJogador[adversario.id].reduce((acc, n) => acc, 0);

                const statsFinais = jogosService.registrarPartida({
                    vencedor: vencedorObj.nome,
                    perdedor: perdedorObj.nome,
                    tirosVencedor: 0,
                    tirosPerdedor: 0,
                    duracaoSegundos,
                    melhorSequencia: sala.melhorSequencia,
                });

                io.to(codigo).emit('batalha:fim-de-jogo', {
                    vencedorId: socket.id,
                    vencedorNome: vencedorObj.nome,
                    duracaoSegundos,
                    melhorSequencia: sala.melhorSequencia,
                    resumo: statsFinais.resumo,
                });

                salas.delete(codigo);
                console.log(`[Jogos] Sala ${codigo} encerrada. Vencedor: ${vencedorObj.nome}`);
            } else {
                sala.turno = payload.proximo;
            }
        });

        // ── Jogar de Novo ────────────────────────────────────────
        socket.on('batalha:jogar-de-novo', ({ codigo }) => {
            // Notifica o parceiro para reiniciar
            socket.to(codigo).emit('batalha:parceiro-quer-jogar-de-novo');
        });

        // ── Desconexão ───────────────────────────────────────────
        socket.on('disconnect', () => {
            // Remove jogador das salas ativas
            for (const [codigo, sala] of salas.entries()) {
                const idx = sala.jogadores.findIndex(j => j.id === socket.id);
                if (idx !== -1) {
                    sala.jogadores.splice(idx, 1);
                    io.to(codigo).emit('batalha:parceiro-saiu');
                    if (sala.jogadores.length === 0) salas.delete(codigo);
                    break;
                }
            }
            console.log(`[Jogos] Desconectado: ${socket.id}`);
        });
    });
}

module.exports = { inicializar, NAVIOS_CONFIG, TAMANHO_TABULEIRO };
