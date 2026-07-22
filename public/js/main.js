// Animações e utilidades JavaScript

console.log('🎁 Bem-vindo ao Nosso Lugar!');

// Efeito de fade-in nos elementos
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el, index) => {
        el.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s both`;
    });

    // Inicia os corações flutuantes
    iniciarCoracoesFlutuantes();
});

// Função para animação de scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// --- SISTEMA DE PARTÍCULAS ROMÂNTICAS ---

function iniciarCoracoesFlutuantes() {
    let container = document.getElementById('floating-hearts-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'floating-hearts-container';
        document.body.appendChild(container);
    }

    const icons = ['❤️', '💖', '💕', '💘', '🌸', '✨'];

    // Gera um coração a cada 600ms
    setInterval(() => {
        const heart = document.createElement('div');
        heart.classList.add('floating-heart');
        
        // Propriedades aleatórias
        heart.textContent = icons[Math.floor(Math.random() * icons.length)];
        heart.style.left = Math.random() * 100 + 'vw';
        
        const duration = 5 + Math.random() * 5; // 5 a 10s
        heart.style.animationDuration = duration + 's';
        
        const size = 12 + Math.random() * 18; // 12px a 30px
        heart.style.fontSize = size + 'px';
        
        container.appendChild(heart);
        
        // Remove após a animação acabar
        setTimeout(() => {
            heart.remove();
        }, duration * 1000);
    }, 600);
}

// Chuva de confetes românticos (Corações e Brilhos)
window.lancarConfetesComemorativos = function() {
    const duracao = 3 * 1000;
    const fim = Date.now() + duracao;
    const cores = ['#5A1C35', '#A35F74', '#BFA7A0', '#ffc0cb', '#ffd700'];

    (function frame() {
        // Criar elemento de confete no DOM
        const confete = document.createElement('div');
        confete.style.position = 'fixed';
        confete.style.zIndex = '10001';
        confete.style.pointerEvents = 'none';
        
        const tipos = ['❤️', '🌸', '✨', '•', '♦'];
        confete.textContent = tipos[Math.floor(Math.random() * tipos.length)];
        confete.style.color = cores[Math.floor(Math.random() * cores.length)];
        
        // Posição de origem (centro inferior da tela ou lateral aleatória)
        confete.style.left = Math.random() * 100 + 'vw';
        confete.style.top = '-10px';
        
        const tamanho = 10 + Math.random() * 20;
        confete.style.fontSize = tamanho + 'px';
        
        // Estilo de queda
        confete.style.transition = 'transform 3s linear, opacity 3s ease-out';
        document.body.appendChild(confete);

        // Disparar animação via reflow + timeout
        requestAnimationFrame(() => {
            const destX = (Math.random() - 0.5) * 200;
            const destY = window.innerHeight + 50;
            const rot = Math.random() * 720 - 360;
            confete.style.transform = `translate(${destX}px, ${destY}px) rotate(${rot}deg)`;
            confete.style.opacity = '0';
        });

        setTimeout(() => {
            confete.remove();
        }, 3000);

        if (Date.now() < fim) {
            requestAnimationFrame(frame);
        }
    }());
};

