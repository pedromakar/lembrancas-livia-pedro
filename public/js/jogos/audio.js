// =====================================================
// public/js/jogos/audio.js
// Módulo de sons do jogo usando Web Audio API
// (sem dependências externas)
// =====================================================

const AudioJogo = (() => {
    let ctx = null;
    let habilitado = true;

    function getCtx() {
        if (!ctx) {
            try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { habilitado = false; }
        }
        return ctx;
    }

    // ---- Toca um bip simples com frequência e duração configuráveis ----
    function tocar(frequencia, duracao = 0.15, tipo = 'sine', volume = 0.3) {
        if (!habilitado) return;
        const c = getCtx();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain);
        gain.connect(c.destination);
        osc.type = tipo;
        osc.frequency.value = frequencia;
        gain.gain.setValueAtTime(volume, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duracao);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + duracao);
    }

    // ---- Sons específicos do jogo ----
    return {
        habilitar() { habilitado = true; },
        desabilitar() { habilitado = false; },

        // Tiro no mar (erro)
        erro() {
            tocar(200, 0.3, 'sine', 0.2);
        },

        // Tiro certeiro (acerto)
        acerto() {
            tocar(440, 0.1, 'square', 0.3);
            setTimeout(() => tocar(550, 0.15, 'square', 0.25), 100);
        },

        // Navio afundado
        afundado() {
            tocar(300, 0.1, 'sawtooth', 0.3);
            setTimeout(() => tocar(250, 0.1, 'sawtooth', 0.25), 120);
            setTimeout(() => tocar(180, 0.4, 'sawtooth', 0.2), 240);
        },

        // Vitória
        vitoria() {
            const notas = [523, 659, 784, 1047];
            notas.forEach((n, i) => setTimeout(() => tocar(n, 0.25, 'triangle', 0.35), i * 180));
        },

        // Derrota
        derrota() {
            const notas = [400, 350, 300, 250];
            notas.forEach((n, i) => setTimeout(() => tocar(n, 0.3, 'sine', 0.25), i * 200));
        },

        // Click / seleção
        click() {
            tocar(600, 0.08, 'sine', 0.15);
        },

        // Posicionou navio
        posicionou() {
            tocar(440, 0.1, 'sine', 0.2);
            setTimeout(() => tocar(550, 0.1, 'sine', 0.15), 100);
        },
    };
})();

window.AudioJogo = AudioJogo;
