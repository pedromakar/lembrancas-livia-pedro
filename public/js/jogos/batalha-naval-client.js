// =====================================================
// public/js/jogos/batalha-naval-client.js
// Lógica do cliente para o Batalha Naval
// Comunica com o servidor via Socket.io
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    // ── Conexão Socket.io ───────────────────────────
    const socket = io();

    // ── Estado local do jogo ────────────────────────
    const estado = {
        minhaId: null,
        meuNome: '',
        adversarioNome: '',
        meuTurno: false,
        navioSelecionado: null,
        horizontal: true,
        naviosPosicionados: [],
        naviosConfig: [],
        naviosRestantesAdversario: [],
        naviosPropiosAfundados: [],
        sequenciaAcertos: 0,
    };

    // ── Mensagens engraçadas ────────────────────────
    const mensagensAcerto = [
        '💥 BUUM! Acertou em cheio!',
        '🎯 Que mira perfeita, amor!',
        '😏 Sabia que ia acertar!',
        '💕 Meu amor é um atirador!',
        '🔥 Tá pegando fogo!',
        '😤 Não tem onde se esconder!',
    ];
    const mensagensErro = [
        '💨 Errou feeio, só água!',
        '🌊 Atirou no mar! Nem perto.',
        '😂 Minha avó atira melhor!',
        '🐟 Matou só um peixinho.',
        '😅 Quase... mas não!',
        '🙈 Fecha o olho e atira?',
    ];
    const mensagensAfundado = [
        '💔 Navio afundado! Sem dó.',
        '🌊 Glub glub glub... se foi!',
        '😱 Afundooou! Que catástrofe!',
        '🏆 Mais um pra conta!',
    ];

    function msgAleatoria(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // ── Utilitários de UI ────────────────────────────
    function mostrarFase(id) {
        document.querySelectorAll('.fase').forEach(f => f.classList.remove('ativa'));
        const el = document.getElementById(id);
        if (el) el.classList.add('ativa');
    }

    function toast(msg, duracao = 3000) {
        const el = document.getElementById('bn-toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('visivel');
        clearTimeout(el._timer);
        el._timer = setTimeout(() => el.classList.remove('visivel'), duracao);
    }

    function addLog(msg, classe = '') {
        const log = document.getElementById('log-jogadas');
        if (!log) return;
        const el = document.createElement('div');
        el.className = `log-entrada ${classe}`;
        el.textContent = msg;
        log.prepend(el);
        // Mantém máximo 30 entradas
        const entradas = log.querySelectorAll('.log-entrada');
        if (entradas.length > 30) entradas[entradas.length - 1].remove();
    }

    // ── Corações voando na tela ─────────────────────
    function voeCoracao(x, y) {
        const h = document.createElement('span');
        h.className = 'coracao-deco';
        h.textContent = ['💕', '❤️', '💖', '💗'][Math.floor(Math.random() * 4)];
        h.style.left = `${x}px`;
        h.style.top  = `${y}px`;
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 4000);
    }

    // ── Confetes de vitória ─────────────────────────
    function lancarConfetes() {
        const cores = ['#5A1C35','#C9956C','#dbb08a','#7a2d46','#f5ede6'];
        for (let i = 0; i < 80; i++) {
            setTimeout(() => {
                const c = document.createElement('div');
                c.className = 'confete';
                c.style.left = `${Math.random() * 100}vw`;
                c.style.top  = '-10px';
                c.style.background = cores[Math.floor(Math.random() * cores.length)];
                c.style.animationDuration = `${2 + Math.random() * 2}s`;
                c.style.animationDelay   = '0s';
                document.body.appendChild(c);
                setTimeout(() => c.remove(), 4000);
            }, i * 30);
        }
    }

    // ── Construção do Tabuleiro ──────────────────────
    function criarTabuleiro(idContainer, clicavel = false) {
        const container = document.getElementById(idContainer);
        if (!container) return;
        container.innerHTML = '';
        container.className = 'tabuleiro';

        const letras = ['A','B','C','D','E','F','G','H','I','J'];
        
        const corner = document.createElement('div');
        corner.style.gridRow = '1'; corner.style.gridColumn = '1';
        container.appendChild(corner);
        
        for(let i=1; i<=10; i++) { 
            const h = document.createElement('div'); h.className='tab-header'; h.textContent=i; 
            h.style.gridRow = '1'; h.style.gridColumn = `${i+1}`;
            container.appendChild(h); 
        }

        // Linhas
        for (let l = 0; l < 10; l++) {
            // Header da linha (letra)
            const lh = document.createElement('div');
            lh.className = 'tab-header';
            lh.textContent = letras[l];
            lh.style.gridRow = `${l+2}`; lh.style.gridColumn = '1';
            container.appendChild(lh);

            // Células
            for (let c = 0; c < 10; c++) {
                const cel = document.createElement('div');
                cel.className = 'tab-celula';
                cel.id = `${idContainer}-${l}-${c}`;
                cel.style.gridRow = `${l+2}`; cel.style.gridColumn = `${c+2}`;

                if (clicavel) {
                    cel.addEventListener('click',   () => handleCliqueAtaque(l, c));
                    cel.addEventListener('mouseenter', () => handleHoverAtaque(l, c));
                }
                container.appendChild(cel);
            }
        }
    }

    function criarTabuleiroPos(idContainer) {
        const container = document.getElementById(idContainer);
        if (!container) return;
        container.innerHTML = '';
        container.className = 'tabuleiro';

        const letras = ['A','B','C','D','E','F','G','H','I','J'];
        
        const corner = document.createElement('div');
        corner.style.gridRow = '1'; corner.style.gridColumn = '1';
        container.appendChild(corner);
        
        for(let i=1; i<=10; i++) { 
            const h = document.createElement('div'); h.className='tab-header'; h.textContent=i; 
            h.style.gridRow = '1'; h.style.gridColumn = `${i+1}`;
            container.appendChild(h); 
        }
        
        for (let l = 0; l < 10; l++) {
            const lh = document.createElement('div'); lh.className = 'tab-header'; lh.textContent = letras[l]; 
            lh.style.gridRow = `${l+2}`; lh.style.gridColumn = '1';
            container.appendChild(lh);
            
            for (let c = 0; c < 10; c++) {
                const cel = document.createElement('div');
                cel.className = 'tab-celula';
                cel.id = `tab-pos-${l}-${c}`;
                cel.style.gridRow = `${l+2}`; cel.style.gridColumn = `${c+2}`;
                cel.addEventListener('click',      () => handleCliquePosicionar(l, c));
                cel.addEventListener('mouseenter', () => handleHoverPosicionar(l, c));
                cel.addEventListener('mouseleave', () => limparPreview());
                container.appendChild(cel);
            }
        }
    }

    // ── Posicionamento de navios ─────────────────────
    function handleHoverPosicionar(l, c) {
        limparPreview();
        if (!estado.navioSelecionado) return;
        const { tamanho } = estado.navioSelecionado;
        const celulas = getCelulasNavio(l, c, tamanho, estado.horizontal);
        const valido = celulas.every(([ll, cc]) => ll >= 0 && ll < 10 && cc >= 0 && cc < 10 && !isCelulaOcupada(ll, cc));
        celulas.forEach(([ll, cc]) => {
            const el = document.getElementById(`tab-pos-${ll}-${cc}`);
            if (el) el.classList.add(valido ? 'preview' : 'preview-invalido');
        });
    }

    function limparPreview() {
        document.querySelectorAll('.preview, .preview-invalido').forEach(el => {
            el.classList.remove('preview', 'preview-invalido');
        });
    }

    function handleCliquePosicionar(l, c) {
        if (!estado.navioSelecionado) { toast('Selecione um navio primeiro! 👆'); return; }
        const { tamanho, id, nome, emoji } = estado.navioSelecionado;
        const celulas = getCelulasNavio(l, c, tamanho, estado.horizontal);

        if (!celulas.every(([ll, cc]) => ll >= 0 && ll < 10 && cc >= 0 && cc < 10 && !isCelulaOcupada(ll, cc))) {
            toast('Posição inválida! Tente outro lugar.'); return;
        }

        // Marca no tabuleiro e adiciona o emoji no meio do navio
        const meio = Math.floor(celulas.length / 2);
        celulas.forEach(([ll, cc], index) => {
            const el = document.getElementById(`tab-pos-${ll}-${cc}`);
            if (el) { 
                el.classList.add('navio'); 
                el.dataset.navioId = id; 
                if (index === meio) {
                    el.innerHTML = `<span style="font-size: 1.2rem;">${emoji}</span>`;
                }
            }
        });

        estado.naviosPosicionados.push({ id, nome, emoji, tamanho, linha: l, coluna: c, horizontal: estado.horizontal });
        marcarNavioPosicionado(id);
        limparPreview();
        AudioJogo.posicionou();
        toast(`${emoji} ${nome} posicionado!`);

        // Se todos posicionados, ativa botão de confirmar
        const totalNecessario = estado.naviosConfig.reduce((s, n) => s + n.quantidade, 0);
        if (estado.naviosPosicionados.length >= totalNecessario) {
            document.getElementById('btn-confirmar-posicao').disabled = false;
            toast('Todos posicionados! Clique em Confirmar quando estiver pronto! ✅', 4000);
        }
    }

    function getCelulasNavio(l, c, tamanho, horizontal) {
        const cells = [];
        for (let i = 0; i < tamanho; i++) {
            cells.push(horizontal ? [l, c + i] : [l + i, c]);
        }
        return cells;
    }

    function isCelulaOcupada(l, c) {
        return estado.naviosPosicionados.some(n => {
            for (let i = 0; i < n.tamanho; i++) {
                const nl = n.horizontal ? n.linha : n.linha + i;
                const nc = n.horizontal ? n.coluna + i : n.coluna;
                if (nl === l && nc === c) return true;
            }
            return false;
        });
    }

    function marcarNavioPosicionado(id) {
        const item = document.querySelector(`.navio-item[data-id="${id}"]`);
        if (item) item.classList.add('posicionado');
        estado.navioSelecionado = null;
        document.querySelectorAll('.navio-item').forEach(i => i.classList.remove('selecionado'));
    }

    // ── Posicionamento aleatório ─────────────────────
    function posicionarAleatorio() {
        // Limpa posicionamentos anteriores
        estado.naviosPosicionados = [];
        document.querySelectorAll('#tab-pos .tab-celula').forEach(el => {
            el.classList.remove('navio');
            delete el.dataset.navioId;
        });
        document.querySelectorAll('#tab-pos .navio-overlay').forEach(el => el.remove());
        document.querySelectorAll('.navio-item').forEach(i => i.classList.remove('posicionado'));

        for (const cfg of estado.naviosConfig) {
            for (let q = 0; q < cfg.quantidade; q++) {
                let posicionado = false;
                let tentativas = 0;
                while (!posicionado && tentativas < 200) {
                    tentativas++;
                    const horiz = Math.random() > 0.5;
                    const l = Math.floor(Math.random() * 10);
                    const c = Math.floor(Math.random() * 10);
                    const celulas = getCelulasNavio(l, c, cfg.tamanho, horiz);
                    if (celulas.every(([ll, cc]) => ll >= 0 && ll < 10 && cc >= 0 && cc < 10 && !isCelulaOcupada(ll, cc))) {
                        const id = `${cfg.tamanho}-${q}`;
                        celulas.forEach(([ll, cc]) => {
                            const el = document.getElementById(`tab-pos-${ll}-${cc}`);
                            if (el) { el.classList.add('navio'); el.dataset.navioId = id; }
                        });
                        const novoNavio = { id, nome: cfg.nome, icone: cfg.icone, tamanho: cfg.tamanho, linha: l, coluna: c, horizontal: horiz };
                        estado.naviosPosicionados.push(novoNavio);
                        adicionarOverlayNavio('tab-pos', novoNavio);
                        posicionado = true;
                    }
                }
            }
        }
        document.querySelectorAll('.navio-item').forEach(i => i.classList.add('posicionado'));
        document.getElementById('btn-confirmar-posicao').disabled = false;
        AudioJogo.posicionou();
        toast('Navios posicionados aleatoriamente! 🎲');
    }

    // ── Ataque ───────────────────────────────────────
    function handleHoverAtaque(l, c) {
        if (!estado.meuTurno) return;
        const el = document.getElementById(`tab-ataque-${l}-${c}`);
        if (el && !el.classList.contains('acerto') && !el.classList.contains('erro') && !el.classList.contains('afundado')) {
            el.querySelector('.celula-icon') && (el.querySelector('.celula-icon').textContent = '🎯');
        }
    }

    function handleCliqueAtaque(l, c) {
        if (!estado.meuTurno) { toast('Aguarde sua vez! ⏳'); return; }
        const el = document.getElementById(`tab-ataque-${l}-${c}`);
        if (!el) return;
        if (el.classList.contains('acerto') || el.classList.contains('erro') || el.classList.contains('afundado')) {
            toast('Você já atirou aqui!'); return;
        }
        socket.emit('batalha:atirar', { codigo: estado.sala, linha: l, coluna: c });
        estado.meuTurno = false;
        atualizarIndicadorTurno();
    }

    // ── Atualiza indicador de turno ──────────────────
    function atualizarIndicadorTurno() {
        const ind = document.getElementById('turno-texto');
        const dot = document.getElementById('turno-dot');
        if (!ind) return;
        if (estado.meuTurno) {
            ind.textContent = 'Sua vez de atirar! 🎯';
            if (dot) { dot.style.background = '#dc2626'; }
            document.getElementById('campo-inimigo')?.classList.add('meu-turno');
        } else {
            ind.textContent = `Vez de ${estado.adversarioNome}... ⏳`;
            if (dot) { dot.style.background = '#76656D'; }
            document.getElementById('campo-inimigo')?.classList.remove('meu-turno');
        }
    }

    // ── Aplica resultado do tiro no tabuleiro ────────
    function aplicarTiro({ atirador, linha, coluna, acertou, navioAfundado }) {
        const fui = atirador === estado.minhaId;

        if (fui) {
            // Meu tiro no tabuleiro adversário
            const el = document.getElementById(`tab-ataque-${linha}-${coluna}`);
            if (el) {
                const icon = el.querySelector('.celula-icon') || (() => {
                    const d = document.createElement('div');
                    d.className = 'celula-icon';
                    el.appendChild(d);
                    return d;
                })();
                el.classList.remove('preview');
                if (navioAfundado) {
                    adicionarOverlayNavio('tab-ataque', navioAfundado);
                    // Pinta todas as células do navio afundado
                    for(let i=0; i<navioAfundado.tamanho; i++){
                        const ll = navioAfundado.horizontal ? navioAfundado.linha : navioAfundado.linha + i;
                        const cc = navioAfundado.horizontal ? navioAfundado.coluna + i : navioAfundado.coluna;
                        const e = document.getElementById(`tab-ataque-${ll}-${cc}`);
                        if(e){
                            e.classList.remove('acerto');
                            e.classList.add('afundado');
                            e.innerHTML = '<div class="celula-icon" style="z-index:10; position:relative;"><i class="fas fa-gem" style="color:#ffd700;font-size:0.85rem;"></i></div>';
                        }
                    }
                    AudioJogo.afundado();
                    toast(msgAleatoria(mensagensAfundado), 3500);
                    addLog(`${estado.meuNome}: descobriu o ${navioAfundado.icone} ${navioAfundado.nome}!`, 'afundado-log');
                    adicionarNavioAfundadoAdversario(navioAfundado);
                    voeCoracao(window.innerWidth / 2, window.innerHeight / 2);
                } else if (acertou) {
                    el.classList.add('acerto');
                    icon.innerHTML = '<i class="fas fa-heart" style="color:var(--bordo,#5A1C35);"></i>';
                    AudioJogo.acerto();
                    toast(msgAleatoria(mensagensAcerto), 2500);
                    addLog(`${estado.meuNome}: ACERTOU em ${coordStr(linha, coluna)}!`, 'acerto-log');
                } else {
                    el.classList.add('erro');
                    icon.innerHTML = '<span class="font-script" style="color:var(--color-muted,#7A6B63);font-size:1.1rem;opacity:0.65;">✕</span>';
                    AudioJogo.erro();
                    toast(msgAleatoria(mensagensErro), 2500);
                    addLog(`${estado.meuNome}: errou em ${coordStr(linha, coluna)}.`);
                }
            }
        } else {
            // Tiro do adversário no meu tabuleiro
            const el = document.getElementById(`tab-meu-${linha}-${coluna}`);
            if (el) {
                const icon = el.querySelector('.celula-icon') || (() => {
                    const d = document.createElement('div');
                    d.className = 'celula-icon';
                    el.appendChild(d);
                    return d;
                })();
                if (navioAfundado) {
                    // Atualiza todas as células do meu navio
                    for(let i=0; i<navioAfundado.tamanho; i++){
                        const ll = navioAfundado.horizontal ? navioAfundado.linha : navioAfundado.linha + i;
                        const cc = navioAfundado.horizontal ? navioAfundado.coluna + i : navioAfundado.coluna;
                        const e = document.getElementById(`tab-meu-${ll}-${cc}`);
                        if(e){
                            e.classList.add('acerto');
                            e.innerHTML = '<div class="celula-icon" style="z-index:10; position:relative;"><i class="fas fa-gem" style="color:#ffd700;font-size:0.85rem;"></i></div>';
                        }
                    }
                    addLog(`${estado.adversarioNome}: afundou seu ${navioAfundado.icone} ${navioAfundado.nome}!`, 'afundado-log');
                } else if (acertou) {
                    el.classList.add('acerto');
                    icon.textContent = '💥';
                    addLog(`${estado.adversarioNome}: acertou seu navio em ${coordStr(linha, coluna)}!`, 'acerto-log');
                } else {
                    el.classList.add('erro');
                    icon.textContent = '💧';
                    addLog(`${estado.adversarioNome}: errou em ${coordStr(linha, coluna)}.`);
                }
            }
        }
    }

    function coordStr(l, c) {
        const letras = ['A','B','C','D','E','F','G','H','I','J'];
        return `${letras[l]}${c + 1}`;
    }

    function adicionarNavioAfundadoAdversario(navio) {
        const container = document.getElementById('navios-afundados-adv');
        if (!container) return;
        const badge = document.createElement('span');
        badge.className = 'navio-afundado-badge';
        badge.innerHTML = `${navio.icone} ${navio.nome}`;
        container.appendChild(badge);
    }

    // ── Renderiza meus navios no tabuleiro da batalha ─
    function renderizarNaviosProprios() {
        estado.naviosPosicionados.forEach(navio => {
            adicionarOverlayNavio('tab-meu', navio);
            for (let i = 0; i < navio.tamanho; i++) {
                const l = navio.horizontal ? navio.linha : navio.linha + i;
                const c = navio.horizontal ? navio.coluna + i : navio.coluna;
                const el = document.getElementById(`tab-meu-${l}-${c}`);
                if (el) el.classList.add('navio-proprio');
            }
        });
    }

    // ── Formata segundos em m:ss ─────────────────────
    function formatarTempo(seg) {
        const m = Math.floor(seg / 60);
        const s = seg % 60;
        return `${m}m ${s.toString().padStart(2,'0')}s`;
    }

    // ═══════════════════════════════════════════════
    // Eventos de UI — Lobby
    // ═══════════════════════════════════════════════
    document.getElementById('btn-criar-sala')?.addEventListener('click', () => {
        const nome = document.getElementById('input-nome-criar')?.value.trim();
        if (!nome) { toast('Digite seu nome primeiro! 😊'); return; }
        estado.meuNome = nome;
        AudioJogo.click();
        socket.emit('batalha:criar-sala', { nomeJogador: nome });
    });

    document.getElementById('btn-entrar-sala')?.addEventListener('click', () => {
        const nome   = document.getElementById('input-nome-entrar')?.value.trim();
        const codigo = document.getElementById('input-codigo')?.value.trim().toUpperCase();
        if (!nome)   { toast('Digite seu nome! 😊'); return; }
        if (!codigo || codigo.length !== 4) { toast('Código deve ter 4 letras!'); return; }
        estado.meuNome = nome;
        AudioJogo.click();
        socket.emit('batalha:entrar-sala', { codigo, nomeJogador: nome });
    });

    // ═══════════════════════════════════════════════
    // Eventos de UI — Posicionamento
    // ═══════════════════════════════════════════════
    document.getElementById('btn-rotacionar')?.addEventListener('click', () => {
        estado.horizontal = !estado.horizontal;
        const btn = document.getElementById('btn-rotacionar');
        if (btn) btn.textContent = estado.horizontal ? '↔️ Horizontal' : '↕️ Vertical';
        AudioJogo.click();
    });

    document.getElementById('btn-aleatorio')?.addEventListener('click', () => {
        AudioJogo.click();
        posicionarAleatorio();
    });

    document.getElementById('btn-confirmar-posicao')?.addEventListener('click', () => {
        if (estado.naviosPosicionados.length < estado.naviosConfig.reduce((s, n) => s + n.quantidade, 0)) {
            toast('Posicione todos os navios antes! 🚢'); return;
        }
        AudioJogo.click();
        socket.emit('batalha:navios-posicionados', { codigo: estado.sala, navios: estado.naviosPosicionados });
        toast('Aguardando o adversário posicionar os navios... ⏳', 5000);
        document.getElementById('btn-confirmar-posicao').disabled = true;
    });

    document.getElementById('btn-jogar-de-novo')?.addEventListener('click', () => {
        socket.emit('batalha:jogar-de-novo', { codigo: estado.sala });
        window.location.reload();
    });

    document.getElementById('btn-voltar-jogos')?.addEventListener('click', () => {
        window.location.href = '/jogos';
    });

    // ═══════════════════════════════════════════════
    // Eventos Socket.io — Recebimentos do servidor
    // ═══════════════════════════════════════════════
    socket.on('connect', () => {
        estado.minhaId = socket.id;
    });

    socket.on('batalha:sala-criada', ({ codigo, nomeJogador }) => {
        estado.sala = codigo;
        document.getElementById('codigo-exibido').textContent = codigo;
        mostrarFase('fase-aguardando');
        toast(`Sala ${codigo} criada! Compartilhe o código com ela/ele 💕`, 5000);
    });

    socket.on('batalha:erro', ({ msg }) => {
        toast(`❌ ${msg}`, 4000);
    });

    socket.on('batalha:jogadores-prontos', ({ jogadores }) => {
        const adversario = jogadores.find(j => j.id !== estado.minhaId);
        if (adversario) estado.adversarioNome = adversario.nome;
        toast(`${adversario?.nome || 'Adversário'} entrou na sala! Vamos jogar? 💕`, 3000);
    });

    socket.on('batalha:fase-posicionamento', ({ naviosConfig }) => {
        estado.naviosConfig = naviosConfig;
        estado.sala = estado.sala || '';

        // Renderiza sidebar de navios
        const painel = document.getElementById('navios-lista');
        if (painel) {
            painel.innerHTML = '';
            naviosConfig.forEach(cfg => {
                for (let q = 0; q < cfg.quantidade; q++) {
                    const id = `${cfg.tamanho}-${q}`;
                    const item = document.createElement('div');
                    item.className = 'navio-item';
                    item.dataset.id = id;
                    item.dataset.tamanho = cfg.tamanho;
                    item.innerHTML = `
                        <div class="navio-visual">
                            ${Array.from({ length: cfg.tamanho }, () => '<div class="navio-quadrado"></div>').join('')}
                        </div>
                        <div class="navio-info">
                            <div class="nome">${cfg.icone} ${cfg.nome}</div>
                            <div class="tamanho">${cfg.tamanho} casas</div>
                        </div>
                    `;
                    item.addEventListener('click', () => {
                        if (item.classList.contains('posicionado')) return;
                        AudioJogo.click();
                        document.querySelectorAll('.navio-item').forEach(i => i.classList.remove('selecionado'));
                        item.classList.add('selecionado');
                        estado.navioSelecionado = { id, tamanho: cfg.tamanho, nome: cfg.nome, icone: cfg.icone };
                    });
                    painel.appendChild(item);
                }
            });
        }

        criarTabuleiroPos('tab-pos');
        mostrarFase('fase-posicionamento');
    });

    socket.on('batalha:posicionamento-aceito', () => {
        toast('✅ Posicionamento confirmado! Aguardando adversário...', 4000);
    });

    socket.on('batalha:inicio', ({ turno, jogadores }) => {
        const adversario = jogadores.find(j => j.id !== estado.minhaId);
        if (adversario) estado.adversarioNome = adversario.nome;
        estado.meuTurno = turno === estado.minhaId;

        // Cria os dois tabuleiros
        criarTabuleiro('tab-meu', false);
        criarTabuleiro('tab-ataque', true);
        renderizarNaviosProprios();

        // Labels
        const lbMeu = document.getElementById('campo-meu-label');
        const lbAdv = document.getElementById('campo-adv-label');
        if (lbMeu) lbMeu.textContent = `Meu Campo (${estado.meuNome})`;
        if (lbAdv) lbAdv.textContent = `Campo de ${estado.adversarioNome}`;

        atualizarIndicadorTurno();
        mostrarFase('fase-batalha');
        toast(`A batalha começou! ${estado.meuTurno ? 'Você começa! 🎯' : `${estado.adversarioNome} começa!`}`, 3000);
    });

    socket.on('batalha:resultado-tiro', (payload) => {
        aplicarTiro(payload);
        if (payload.proximo) {
            estado.meuTurno = payload.proximo === estado.minhaId;
            atualizarIndicadorTurno();
        }
        if (payload.acertou && payload.atirador === estado.minhaId) {
            voeCoracao(window.innerWidth * 0.6, window.innerHeight * 0.5);
        }
    });

    socket.on('batalha:fim-de-jogo', ({ vencedorId, vencedorNome, duracaoSegundos, melhorSequencia, resumo }) => {
        const ganhei = vencedorId === estado.minhaId;

        document.getElementById('vitoria-emoji').textContent    = ganhei ? '🏆' : '💔';
        document.getElementById('vitoria-titulo').textContent   = ganhei ? 'Você Ganhou!' : 'Você Perdeu!';
        document.getElementById('vitoria-sub').textContent      = ganhei
            ? `Parabéns ${estado.meuNome}! Todos os navios de ${estado.adversarioNome} foram afundados! 💕`
            : `${vencedorNome} foi demais desta vez... próxima você consegue! 💪`;

        document.getElementById('vitoria-duracao').textContent      = formatarTempo(duracaoSegundos);
        document.getElementById('vitoria-sequencia').textContent    = melhorSequencia;
        document.getElementById('vitoria-placar-pedro').textContent = resumo.vitoriasPedro;
        document.getElementById('vitoria-placar-livia').textContent = resumo.vitoriasLivia;

        mostrarFase('fase-vitoria');
        if (ganhei) { AudioJogo.vitoria(); lancarConfetes(); }
        else          AudioJogo.derrota();
    });

    socket.on('batalha:parceiro-saiu', () => {
        toast('😢 Seu parceiro saiu do jogo. A partida foi encerrada.', 6000);
        setTimeout(() => { window.location.href = '/jogos'; }, 5000);
    });

    socket.on('batalha:parceiro-quer-jogar-de-novo', () => {
        toast('Seu parceiro quer jogar de novo! Recarregue a página. 🔄', 5000);
    });

    socket.on('disconnect', () => {
        toast('❌ Desconectado do servidor. Tentando reconectar...', 5000);
    });

    function adicionarOverlayNavio(containerId, navio) {
        const overlay = document.createElement('div');
        overlay.className = 'navio-overlay';
        const rowStart = navio.linha + 2;
        const colStart = navio.coluna + 2;
        if (navio.horizontal) {
            overlay.style.gridArea = `${rowStart} / ${colStart} / span 1 / span ${navio.tamanho}`;
        } else {
            overlay.style.gridArea = `${rowStart} / ${colStart} / span ${navio.tamanho} / span 1`;
        }
        overlay.innerHTML = navio.icone;
        document.getElementById(containerId).appendChild(overlay);
    }
});
