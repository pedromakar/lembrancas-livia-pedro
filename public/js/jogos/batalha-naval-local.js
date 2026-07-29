// =====================================================
// public/js/jogos/batalha-naval-local.js
// Lógica 100% no navegador para o Modo Local (Mesmo PC/Celular)
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // ── Configuração de Navios (Igual ao backend) ──
    const NAVIOS_CONFIG = [
        { nome: 'Porta-aviões', tamanho: 5, quantidade: 1, icone: '<i class="fa-solid fa-ship" style="color: white;"></i>' },
        { nome: 'Cruzador',     tamanho: 4, quantidade: 1, icone: '<i class="fa-solid fa-anchor" style="color: white;"></i>' },
        { nome: 'Destroyer',    tamanho: 3, quantidade: 2, icone: '<i class="fa-solid fa-sailboat" style="color: white;"></i>' },
        { nome: 'Submarino',    tamanho: 2, quantidade: 2, icone: '<i class="fa-solid fa-water" style="color: white;"></i>' },
    ];
    const totalNavios = NAVIOS_CONFIG.reduce((s, n) => s + n.quantidade, 0);

    // ── Estado do Jogo ────────────────────────────────
    let estado = {
        fase: 'lobby', // lobby | setup | blindfold | batalha | vitoria
        p1: { nome: '', tab: criarTabuleiroVazio(), navios: [], naviosAfundados: [], pronto: false },
        p2: { nome: '', tab: criarTabuleiroVazio(), navios: [], naviosAfundados: [], pronto: false },
        jogadorSetupAtual: 1, 
        turno: 1, 
        horizontal: true,
        navioSelecionado: null,
        inicioBatalhaTempo: null,
        melhorSequencia: 0,
        sequenciaAtual: { jogador: null, count: 0 }
    };

    const msgsAcerto = ['💥 BUUM! Acertou em cheio!', '🎯 Que mira perfeita!', '🔥 Tá pegando fogo!'];
    const msgsErro = ['💨 Errou feeio, só água!', '🌊 Atirou no mar! Nem perto.', '💧 Quase... mas não!'];
    const msgsAfundado = ['💔 Navio afundado!', '🌊 Glub glub glub... se foi!', '🏆 Mais um pra conta!'];

    // ── Utilitários UI ────────────────────────────────
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
        if (log.children.length > 30) log.lastChild.remove();
    }

    function criarTabuleiroVazio() {
        return Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => ({ navio: null, atingido: false })));
    }

    function getJogadorAtual() { return estado.turno === 1 ? estado.p1 : estado.p2; }
    function getAdversario() { return estado.turno === 1 ? estado.p2 : estado.p1; }

    // ── Fase Blindfold (Transição) ────────────────────
    let proximaAcaoBlindfold = null;
    function iniciarFaseCega(jogadorAtivo, jogadorEspiando, callbackAcao) {
        document.getElementById('blindfold-titulo').textContent = `Vez do(a) ${jogadorAtivo}!`;
        const subtitulo = document.querySelector('#fase-blindfold .subtitulo');
        subtitulo.textContent = `${jogadorEspiando}, feche os olhos ou vire de costas! 👀`;
        
        proximaAcaoBlindfold = callbackAcao;
        mostrarFase('fase-blindfold');
    }

    document.getElementById('btn-estou-com-celular').addEventListener('click', () => {
        AudioJogo.click();
        if (proximaAcaoBlindfold) proximaAcaoBlindfold();
    });

    // ── Início (Lobby) ────────────────────────────────
    document.getElementById('btn-iniciar-setup').addEventListener('click', () => {
        const n1 = document.getElementById('input-p1').value.trim() || 'Jogador 1';
        const n2 = document.getElementById('input-p2').value.trim() || 'Jogador 2';
        estado.p1.nome = n1;
        estado.p2.nome = n2;
        AudioJogo.click();
        
        // P1 posiciona primeiro
        estado.jogadorSetupAtual = 1;
        iniciarFaseCega(estado.p1.nome, estado.p2.nome, iniciarSetupPosicionamento);
    });

    // ── Setup de Posicionamento ───────────────────────
    function iniciarSetupPosicionamento() {
        const jogador = estado.jogadorSetupAtual === 1 ? estado.p1 : estado.p2;
        estado.navioSelecionado = null;
        document.querySelector('.bn-posicionamento h2').textContent = `⚓ ${jogador.nome}, posicione seus Navios`;
        
        renderizarPainelNavios(jogador);
        criarTabuleiroPos();
        document.getElementById('btn-confirmar-posicao').disabled = true;
        mostrarFase('fase-posicionamento');
        toast(`${jogador.nome}, prepare sua frota!`);
    }

    function renderizarPainelNavios(jogador) {
        const painel = document.getElementById('navios-lista');
        painel.innerHTML = '';
        NAVIOS_CONFIG.forEach(cfg => {
            for (let q = 0; q < cfg.quantidade; q++) {
                const id = `${cfg.tamanho}-${q}`;
                const jaColocado = jogador.navios.find(n => n.id === id);
                
                const item = document.createElement('div');
                item.className = 'navio-item' + (jaColocado ? ' posicionado' : '');
                item.dataset.id = id;
                item.innerHTML = `
                    <div class="navio-visual">${Array.from({length: cfg.tamanho}, ()=> '<div class="navio-quadrado"></div>').join('')}</div>
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

    function criarTabuleiroPos() {
        const container = document.getElementById('tab-pos');
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
                cel.addEventListener('mouseenter', () => hoverPos(l, c));
                cel.addEventListener('mouseleave', limparPreview);
                cel.addEventListener('click', () => clickPos(l, c));
                container.appendChild(cel);
            }
        }
    }

    function getCelulasNavio(l, c, tamanho, horizontal) {
        return Array.from({length: tamanho}, (_, i) => horizontal ? [l, c + i] : [l + i, c]);
    }

    function hoverPos(l, c) {
        limparPreview();
        if (!estado.navioSelecionado) return;
        const jogador = estado.jogadorSetupAtual === 1 ? estado.p1 : estado.p2;
        const { tamanho } = estado.navioSelecionado;
        const celulas = getCelulasNavio(l, c, tamanho, estado.horizontal);
        const valido = celulas.every(([ll, cc]) => ll>=0 && ll<10 && cc>=0 && cc<10 && jogador.tab[ll][cc].navio === null);
        celulas.forEach(([ll, cc]) => {
            const el = document.getElementById(`tab-pos-${ll}-${cc}`);
            if (el) el.classList.add(valido ? 'preview' : 'preview-invalido');
        });
    }

    function limparPreview() {
        document.querySelectorAll('.preview, .preview-invalido').forEach(el => el.classList.remove('preview', 'preview-invalido'));
    }

    document.getElementById('btn-rotacionar').addEventListener('click', (e) => {
        estado.horizontal = !estado.horizontal;
        e.target.textContent = estado.horizontal ? '↔️ Horizontal' : '↕️ Vertical';
        AudioJogo.click();
    });

    document.getElementById('btn-aleatorio').addEventListener('click', () => {
        AudioJogo.click();
        const jogador = estado.jogadorSetupAtual === 1 ? estado.p1 : estado.p2;
        jogador.tab = criarTabuleiroVazio();
        jogador.navios = [];
        
        NAVIOS_CONFIG.forEach(cfg => {
            for (let q = 0; q < cfg.quantidade; q++) {
                let posicionado = false;
                while (!posicionado) {
                    const horiz = Math.random() > 0.5;
                    const l = Math.floor(Math.random() * 10);
                    const c = Math.floor(Math.random() * 10);
                    const celulas = getCelulasNavio(l, c, cfg.tamanho, horiz);
                    if (celulas.every(([ll, cc]) => ll>=0 && ll<10 && cc>=0 && cc<10 && jogador.tab[ll][cc].navio === null)) {
                        const id = `${cfg.tamanho}-${q}`;
                        celulas.forEach(([ll, cc]) => jogador.tab[ll][cc].navio = id);
                        jogador.navios.push({ id, nome: cfg.nome, icone: cfg.icone, tamanho: cfg.tamanho, linha: l, coluna: c, horizontal: horiz });
                        posicionado = true;
                    }
                }
            }
        });
        // Atualiza UI
        renderizarPainelNavios(jogador);
        criarTabuleiroPos();
        jogador.navios.forEach(navio => adicionarOverlayNavio('tab-pos', navio));
        document.getElementById('btn-confirmar-posicao').disabled = false;
    });

    function clickPos(l, c) {
        if (!estado.navioSelecionado) return;
        const jogador = estado.jogadorSetupAtual === 1 ? estado.p1 : estado.p2;
        const { tamanho, id, nome, icone } = estado.navioSelecionado;
        const celulas = getCelulasNavio(l, c, tamanho, estado.horizontal);
        
        if (!celulas.every(([ll, cc]) => ll>=0 && ll<10 && cc>=0 && cc<10 && jogador.tab[ll][cc].navio === null)) {
            return toast('Posição inválida!');
        }

        celulas.forEach(([ll, cc]) => jogador.tab[ll][cc].navio = id);
        const novoNavio = { id, nome, icone, tamanho, linha: l, coluna: c, horizontal: estado.horizontal };
        jogador.navios.push(novoNavio);
        
        adicionarOverlayNavio('tab-pos', novoNavio);
        
        estado.navioSelecionado = null;
        limparPreview();
        renderizarPainelNavios(jogador); // Atualiza painel listando como posicionado
        AudioJogo.posicionou();

        if (jogador.navios.length === totalNavios) {
            document.getElementById('btn-confirmar-posicao').disabled = false;
        }
    }

    document.getElementById('btn-confirmar-posicao').addEventListener('click', () => {
        AudioJogo.click();
        const jogador = estado.jogadorSetupAtual === 1 ? estado.p1 : estado.p2;
        jogador.pronto = true;

        if (estado.jogadorSetupAtual === 1) {
            estado.jogadorSetupAtual = 2;
            iniciarFaseCega(estado.p2.nome, estado.p1.nome, iniciarSetupPosicionamento);
        } else {
            // Ambos prontos, começar batalha
            estado.turno = 1;
            estado.inicioBatalhaTempo = Date.now();
            iniciarBatalhaLocal();
        }
    });

    // ── Batalha ───────────────────────────────────────
    function criarGridBatalha(containerId, isAtaque, atiradorId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        container.className = 'tabuleiro' + (isAtaque ? ' campo-inimigo' : '');
        
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
                cel.id = `${containerId}-${l}-${c}`;
                cel.style.gridRow = `${l+2}`; cel.style.gridColumn = `${c+2}`;
                
                if (isAtaque) {
                    cel.addEventListener('mouseenter', () => { if(estado.turno === atiradorId) cel.classList.add('alvo-mira'); });
                    cel.addEventListener('mouseleave', () => cel.classList.remove('alvo-mira'));
                    cel.addEventListener('click', () => atirar(l, c, atiradorId, containerId));
                }
                container.appendChild(cel);
            }
        }
    }

    function renderizarAmbosTabuleiros() {
        // Campo de Player 1 (Player 2 ataca aqui)
        document.getElementById('campo-meu-label').textContent = `Campo de ${estado.p1.nome}`;
        criarGridBatalha('tab-meu', true, 2); 

        // Campo de Player 2 (Player 1 ataca aqui)
        document.getElementById('campo-adv-label').textContent = `Campo de ${estado.p2.nome}`;
        criarGridBatalha('tab-ataque', true, 1);
        
        for (let l = 0; l < 10; l++) {
            for (let c = 0; c < 10; c++) {
                // P1
                if (estado.p1.tab[l][c].atingido) {
                    const el = document.getElementById(`tab-meu-${l}-${c}`);
                    if (estado.p1.tab[l][c].navio) {
                        el.classList.add('acerto');
                        el.innerHTML = '<div class="celula-icon"><i class="fas fa-heart" style="color:var(--bordo,#5A1C35);"></i></div>';
                    } else {
                        el.classList.add('erro');
                        el.innerHTML = '<div class="celula-icon"><span class="font-script" style="color:var(--color-muted,#7A6B63);font-size:1.1rem;opacity:0.65;">✕</span></div>';
                    }
                }
                // P2
                if (estado.p2.tab[l][c].atingido) {
                    const el = document.getElementById(`tab-ataque-${l}-${c}`);
                    if (estado.p2.tab[l][c].navio) {
                        el.classList.add('acerto');
                        el.innerHTML = '<div class="celula-icon"><i class="fas fa-heart" style="color:var(--bordo,#5A1C35);"></i></div>';
                    } else {
                        el.classList.add('erro');
                        el.innerHTML = '<div class="celula-icon"><span class="font-script" style="color:var(--color-muted,#7A6B63);font-size:1.1rem;opacity:0.65;">✕</span></div>';
                    }
                }
            }
        }
        
        // Revelados P1
        estado.p1.naviosAfundados.forEach(navio => {
            adicionarOverlayNavio('tab-meu', navio);
            const cells = getCelulasNavio(navio.linha, navio.coluna, navio.tamanho, navio.horizontal);
            cells.forEach(([ll, cc]) => {
                const el = document.getElementById(`tab-meu-${ll}-${cc}`);
                el.classList.remove('acerto');
                el.classList.add('afundado');
                el.innerHTML = '<div class="celula-icon" style="z-index:10; position:relative;"><i class="fas fa-gem" style="color:#ffd700;font-size:0.85rem;"></i></div>';
            });
        });

        // Revelados P2
        estado.p2.naviosAfundados.forEach(navio => {
            adicionarOverlayNavio('tab-ataque', navio);
            const cells = getCelulasNavio(navio.linha, navio.coluna, navio.tamanho, navio.horizontal);
            cells.forEach(([ll, cc]) => {
                const el = document.getElementById(`tab-ataque-${ll}-${cc}`);
                el.classList.remove('acerto');
                el.classList.add('afundado');
                el.innerHTML = '<div class="celula-icon" style="z-index:10; position:relative;"><i class="fas fa-gem" style="color:#ffd700;font-size:0.85rem;"></i></div>';
            });
        });
    }

    function atualizarPainelAfundados() {
        const myCont = document.getElementById('navios-afundados-eu');
        myCont.innerHTML = '';
        estado.p1.naviosAfundados.forEach(n => myCont.innerHTML += `<span class="navio-afundado-badge">${n.icone} ${n.nome}</span>`);
        
        const advCont = document.getElementById('navios-afundados-adv');
        advCont.innerHTML = '';
        estado.p2.naviosAfundados.forEach(n => advCont.innerHTML += `<span class="navio-afundado-badge">${n.icone} ${n.nome}</span>`);
    }

    function iniciarBatalhaLocal() {
        const jAtual = getJogadorAtual();
        document.getElementById('turno-texto').textContent = `Vez de ${jAtual.nome}`;
        renderizarAmbosTabuleiros();
        atualizarPainelAfundados();
        mostrarFase('fase-batalha');
    }

    function atirar(l, c, atiradorId, containerId) {
        if (estado.bloqueado) return;
        if (estado.turno !== atiradorId) {
            return toast(`Calma! É a vez de ${getJogadorAtual().nome}!`);
        }
        
        const adv = atiradorId === 1 ? estado.p2 : estado.p1;
        const jAtual = atiradorId === 1 ? estado.p1 : estado.p2;
        const celula = adv.tab[l][c];
        
        if (celula.atingido) return toast('Você já atirou aí! 🎯');
        
        estado.bloqueado = true;
        
        // Marca como atingido
        celula.atingido = true;
        const coord = `${['A','B','C','D','E','F','G','H','I','J'][l]}${c+1}`;
        const el = document.getElementById(`${containerId}-${l}-${c}`);
        
        if (celula.navio) {
            // Acertou um navio
            AudioJogo.acerto();
            el.classList.add('acerto');
            el.innerHTML = '<div class="celula-icon"><i class="fas fa-heart" style="color:var(--bordo,#5A1C35);"></i></div>';
            
            if (estado.sequenciaAtual.jogador !== jAtual.nome) estado.sequenciaAtual = { jogador: jAtual.nome, count: 0 };
            estado.sequenciaAtual.count++;
            if (estado.sequenciaAtual.count > estado.melhorSequencia) estado.melhorSequencia = estado.sequenciaAtual.count;

            const navioCfg = adv.navios.find(n => n.id === celula.navio);
            const cellsNavio = getCelulasNavio(navioCfg.linha, navioCfg.coluna, navioCfg.tamanho, navioCfg.horizontal);
            const afundou = cellsNavio.every(([ll, cc]) => adv.tab[ll][cc].atingido);
            
            if (afundou) {
                AudioJogo.afundado();
                adv.naviosAfundados.push(navioCfg);
                addLog(`${jAtual.nome} descobriu o ${navioCfg.icone} ${navioCfg.nome} de ${adv.nome}!`, 'afundado-log');
                toast(msgsAfundado[Math.floor(Math.random()*msgsAfundado.length)], 4000);
                
                // Adiciona o overlay do navio afundado
                adicionarOverlayNavio(containerId, navioCfg);
                
                cellsNavio.forEach(([ll, cc]) => {
                    const e = document.getElementById(`${containerId}-${ll}-${cc}`);
                    e.classList.add('afundado');
                    e.innerHTML = '<div class="celula-icon" style="z-index:10; position:relative;"><i class="fas fa-gem" style="color:#ffd700;font-size:0.85rem;"></i></div>';
                });
                
                atualizarPainelAfundados();
                
                // Checa vitória
                if (adv.naviosAfundados.length === totalNavios) {
                    setTimeout(() => finalizarJogo(jAtual, adv), 1500);
                    return;
                }
            } else {
                toast(msgsAcerto[Math.floor(Math.random()*msgsAcerto.length)]);
                addLog(`${jAtual.nome} acertou em ${coord}!`, 'acerto-log');
            }
        } else {
            // Errou
            AudioJogo.erro();
            el.classList.add('erro');
            el.innerHTML = '<div class="celula-icon"><span class="font-script" style="color:var(--color-muted,#7A6B63);font-size:1.1rem;opacity:0.65;">✕</span></div>';
            estado.sequenciaAtual = { jogador: null, count: 0 };
            toast(msgsErro[Math.floor(Math.random()*msgsErro.length)]);
            addLog(`${jAtual.nome} errou em ${coord}.`);
        }
        
        atualizarPainelAfundados();
        
        setTimeout(() => {
            estado.turno = estado.turno === 1 ? 2 : 1;
            estado.bloqueado = false;
            const proxJog = getJogadorAtual();
            document.getElementById('turno-texto').textContent = `Vez de ${proxJog.nome}`;
            toast(`Vez de ${proxJog.nome}!`, 3000);
        }, 1500);
    }

    function finalizarJogo(vencedor, perdedor) {
        const duracao = Math.floor((Date.now() - estado.inicioBatalhaTempo) / 1000);
        
        document.getElementById('vitoria-titulo').textContent = `${vencedor.nome} Ganhou!`;
        document.getElementById('vitoria-sub').textContent = `${perdedor.nome} teve a frota totalmente destruída.`;
        document.getElementById('vitoria-duracao').textContent = `${Math.floor(duracao/60)}m ${duracao%60}s`;
        document.getElementById('vitoria-sequencia').textContent = `${estado.melhorSequencia} acertos`;
        
        // Confetes apenas 1 vez (já q é local)
        for (let i = 0; i < 80; i++) {
            setTimeout(() => {
                const c = document.createElement('div');
                c.className = 'confete';
                c.style.left = `${Math.random() * 100}vw`;
                c.style.background = ['#5A1C35','#C9956C','#dbb08a','#7a2d46'][Math.floor(Math.random() * 4)];
                c.style.animationDuration = `${2 + Math.random() * 2}s`;
                document.body.appendChild(c);
                setTimeout(() => c.remove(), 4000);
            }, i * 30);
        }

        AudioJogo.vitoria();
        mostrarFase('fase-vitoria');

        // Salva estatísticas no backend para atualizar a base geral
        fetch('/jogos/api/salvar-estatistica', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vencedor: vencedor.nome,
                perdedor: perdedor.nome,
                tirosVencedor: 0, 
                tirosPerdedor: 0,
                duracaoSegundos: duracao,
                melhorSequencia: estado.melhorSequencia
            })
        }).then(() => console.log('Placar local salvo no banco!'));
    }

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

    document.getElementById('btn-jogar-de-novo').addEventListener('click', () => window.location.reload());
});
