import { loginAutomatico } from './auth-manager.js';

// 1. Declarar el objeto DB
const DB = {
    'add': { title: '🌟 Misiones de Suma', color: 'c-add', games: [
        { n: '🛸 Nave Colectora',   f: () => window.initDrag('cristales', '💎', 't-caja', null) },
        { n: '🌌 Nebulosa',         f: () => window.initDrag('estrellas', '⭐', 't-pecera', null) },
        { n: '🧳 Mochila Espacial', f: () => window.initDrag('módulos', '🔩', 't-mochila', null) },
        { n: '🪐 Órbita',           f: () => window.initDrag('satélites', '🛰️', 't-bandeja', '🪐') }
    ]},
    'sub': { title: '☄️ Misiones de Resta', color: 'c-sub', games: [
        { n: '👾 Invasor',          f: () => window.initDragSub('🌙', 't-tazon', '👾') },
        { n: '🚀 Nave Espacial',    f: () => window.initDragSub('👨‍🚀', 't-bandeja', '🚀') },
        { n: '💥 Asteroides',       f: () => window.initDestroy('🪨') },
        { n: '⚡ Rayos Láser',      f: () => window.initDestroy('🔵') }
    ]},
    'mul': { title: '🌀 Misiones de Multiplicación', color: 'c-mul', games: [
        { n: '⚡ Clonador Cuántico', f: () => window.initCloner() },
        { n: '🏭 Fábrica Galáctica', f: () => window.initGrid() },
        { n: '🎁 Cápsulas',         f: () => window.initDragMul('Antenas', '📡', 't-regalo', null) },
        { n: '🥚 Huevos Alienígenas',f: () => window.initDragMul('Huevos', '🥚', 't-nido', null) }
    ]},
    'div': { title: '🔭 Misiones de División', color: 'c-div', games: [
        { n: '🍽️ Raciones',         f: () => window.initDragDiv('Cristales', '💎', 't-plato', null) },
        { n: '💰 Cofres Estelares', f: () => window.initDragDiv('Monedas', '🪙', 't-cofre', null) },
        { n: '🐾 Alienígenas',      f: () => window.initDragDiv('Huesos', '🦴', 't-tazon', '👽') },
        { n: '🏀 Portales',         f: () => window.initDragDiv('Balones', '🔮', 't-canasta', null) }
    ]}
};

// 2. SOLUCIÓN AL ERROR: Hacer que DB sea global para que navigation.js lo vea
window.DB = DB;

document.addEventListener('DOMContentLoaded', () => {
    // Eventos Globales
    // Usamos window.Navigation para evitar errores si aún no carga el objeto
    document.getElementById('btn-back').onclick = () => window.Navigation?.back();
    document.getElementById('btn-reset').onclick = () => window.Effects?.resetLevel();
    document.getElementById('btn-check').onclick = () => { if(window.checkLogic) window.checkLogic(); };
    document.getElementById('btn-next').onclick = () => window.Navigation?.restartGame();
    document.getElementById('btn-result-next').onclick = () => { 
        window.Navigation?.restartGame(); 
        window.Navigation?.goTo('screen-game'); 
    };
    document.getElementById('btn-result-menu').onclick = () => window.Navigation?.goTo('screen-sub');
    
    if (window.Effects?.attachGlobalClickSound) {
        window.Effects.attachGlobalClickSound();
    }
    
    // Eventos del Menú Principal
    document.querySelectorAll('.btn-menu[data-op]').forEach(btn => {
        btn.onclick = () => {
            if (window.Navigation && window.Navigation.showMenu) {
                window.Navigation.showMenu(btn.dataset.op);
            } else {
                console.error("El sistema de navegación aún no está listo");
            }
        };
    });
    
    const btnCheck = document.getElementById('btn-check');
    if (btnCheck) {
        btnCheck.onclick = () => {
            // Acceso directo al window.checkLogic que se actualizó en el init del juego
            if (typeof window.checkLogic === 'function') {
                window.checkLogic();
            } else {
                console.error("La función de comprobación no está lista para este reto.");
            }
        };
    }
});

// Lógica del Splash Screen (Cohete)
window.addEventListener('load', async () => {
    const splash = document.getElementById('splash-screen');
    const bar = document.querySelector('.loading-bar');
    let width = 0;

    const registroPromesa = loginAutomatico();

    const interval = setInterval(async () => {
        width += Math.random() * 8;

        if (width >= 90) {
            width = 90;
            bar.style.width = '90%';
            
            const registrado = await registroPromesa;
            if (registrado) {
                width = 100;
                bar.style.width = '100%';
                clearInterval(interval);
                
                setTimeout(() => {
                    if (splash) {
                        splash.style.opacity = '0';
                        splash.style.transition = 'opacity 0.5s ease';
                        setTimeout(() => splash.style.display = 'none', 500);
                    }
                }, 800);
            }
        } else {
            bar.style.width = width + '%';
        }
    }, 100);
});
