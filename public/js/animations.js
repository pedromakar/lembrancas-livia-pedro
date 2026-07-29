/**
 * Nosso Lugar — Animations.js
 * Sistema de animações premium: Scroll Reveal, Parallax, Transições entre páginas
 */

'use strict';

// ─────────────────────────────────────────────
// 1. SCROLL REVEAL (Intersection Observer)
// ─────────────────────────────────────────────
function initScrollReveal() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Não re-observa depois de revelar
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => {
        observer.observe(el);
    });
}

// ─────────────────────────────────────────────
// 2. PARALLAX SUAVE NO HERO
// ─────────────────────────────────────────────
function initParallax() {
    const heroEl = document.querySelector('.hero-home');
    if (!heroEl) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const rate = scrollY * 0.35;
                heroEl.style.transform = `translateY(${rate}px)`;
                heroEl.style.opacity = Math.max(0, 1 - scrollY / 500);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ─────────────────────────────────────────────
// 3. TRANSIÇÃO DE PÁGINA (fade out ao navegar)
// ─────────────────────────────────────────────
function initPageTransitions() {
    // Cria overlay de transição
    const overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    overlay.style.cssText = `
        position: fixed; inset: 0;
        background: var(--dark, #1A0A12);
        z-index: 99998;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.35s ease;
    `;
    document.body.appendChild(overlay);

    // Intercepta links internos
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');
        // Apenas links internos (não ancora, não externos, não javascript)
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('javascript')) return;
        if (link.hasAttribute('target')) return;

        e.preventDefault();
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'all';

        setTimeout(() => {
            window.location.href = href;
        }, 320);
    });

    // Fade in ao carregar nova página
    window.addEventListener('pageshow', () => {
        overlay.style.transition = 'none';
        overlay.style.opacity = '1';
        requestAnimationFrame(() => {
            overlay.style.transition = 'opacity 0.45s ease';
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
        });
    });
}

// ─────────────────────────────────────────────
// 4. SPLASH SCREEN (primeira visita)
// ─────────────────────────────────────────────
function initSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (!splash) return;

    const visitado = sessionStorage.getItem('nl_visitado');

    if (visitado) {
        // Já visitou nesta sessão — remove imediatamente
        splash.remove();
        return;
    }

    // Primeira visita: mostra por 2.2s
    setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => {
            splash.remove();
            sessionStorage.setItem('nl_visitado', 'true');
        }, 800);
    }, 2200);
}

// ─────────────────────────────────────────────
// 5. CONTADOR EM TEMPO REAL (premium)
// ─────────────────────────────────────────────
function initContadorPremium(dataInicioStr) {
    const contadores = {
        dias:     document.getElementById('contador-dias'),
        horas:    document.getElementById('contador-horas'),
        minutos:  document.getElementById('contador-minutos'),
        segundos: document.getElementById('contador-segundos'),
    };

    // Verifica se existe pelo menos um elemento
    if (!contadores.dias && !contadores.segundos) return;

    const dataInicio = new Date(dataInicioStr);

    function atualizar() {
        const agora = new Date();
        const diff = agora - dataInicio;

        if (diff < 0) return; // Data no futuro

        const totalSegundos = Math.floor(diff / 1000);
        const totalMinutos  = Math.floor(totalSegundos / 60);
        const totalHoras    = Math.floor(totalMinutos / 60);
        const totalDias     = Math.floor(totalHoras / 24);

        const horas    = totalHoras % 24;
        const minutos  = totalMinutos % 60;
        const segundos = totalSegundos % 60;

        function setVal(el, val) {
            if (!el) return;
            const str = String(val).padStart(2, '0');
            if (el.textContent !== str) {
                el.textContent = str;
                // Micro-animação no dígito
                el.style.animation = 'none';
                el.offsetHeight; // reflow
                el.style.animation = 'counterUp 0.25s ease';
            }
        }

        setVal(contadores.dias,     totalDias);
        setVal(contadores.horas,    horas);
        setVal(contadores.minutos,  minutos);
        setVal(contadores.segundos, segundos);
    }

    atualizar();
    setInterval(atualizar, 1000);
}

// ─────────────────────────────────────────────
// 6. FRASE DO DIA
// ─────────────────────────────────────────────
function initFraseDoDia(frases) {
    const el = document.getElementById('frase-do-dia-text');
    const autorEl = document.getElementById('frase-do-dia-autor');
    if (!el || !frases || !frases.length) return;

    // Usa o dia do ano como semente para ser consistente durante o dia
    const diaDoAno = Math.floor(
        (new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );
    const frase = frases[diaDoAno % frases.length];

    el.textContent = frase.texto;
    if (autorEl && frase.autor) autorEl.textContent = frase.autor;
}

// ─────────────────────────────────────────────
// 7. BOTÃO "ME SURPREENDA" — lembrança aleatória
// ─────────────────────────────────────────────
function initBotaoSurpreenda() {
    const btn = document.getElementById('btn-surpreenda');
    if (!btn) return;

    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        btn.disabled = true;
        btn.innerHTML = '<span style="animation: spin 0.8s linear infinite; display:inline-block">💫</span> Escolhendo...';

        try {
            const resp = await fetch('/api/lembranca-aleatoria');
            if (!resp.ok) throw new Error('Sem lembranças');
            const data = await resp.json();
            if (data && data.id) {
                window.location.href = `/lembrancas#lembranca-${data.id}`;
            } else {
                window.location.href = '/lembrancas';
            }
        } catch (_) {
            window.location.href = '/lembrancas';
        }
    });
}

// ─────────────────────────────────────────────
// 8. MICRO-INTERAÇÕES em cards
// ─────────────────────────────────────────────
function initCardMicroInteractions() {
    document.querySelectorAll('.card-premium, .destaque-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width  - 0.5;
            const y = (e.clientY - rect.top)  / rect.height - 0.5;
            card.style.transform = `
                perspective(600px)
                rotateY(${x * 6}deg)
                rotateX(${-y * 6}deg)
                translateY(-6px)
            `;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ─────────────────────────────────────────────
// INIT GLOBAL
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initParallax();
    initPageTransitions();
    initSplashScreen();
    initCardMicroInteractions();
    initBotaoSurpreenda();

    console.log('✨ Nosso Lugar — animations.js carregado');
});

// Expõe funções que precisam de dados do servidor (chamadas inline nas views)
window.NL = {
    initContadorPremium,
    initFraseDoDia,
};
