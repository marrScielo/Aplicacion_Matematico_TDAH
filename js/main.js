import { loginAutomatico } from './auth-manager.js';

// 1. Declarar el objeto DB
const DB = {
    'add': { title: 'Retos de Suma', color: 'c-add', games: [
        { n: '📦 Caja Mágica', f: () => window.initDrag('manzanas', '🍎', 't-caja', null) },
        { n: '🐟 Pecera', f: () => window.initDrag('peces', '🐟', 't-pecera', null) },
        { n: '🎒 Mochila', f: () => window.initDrag('lápices', '✏️', 't-mochila', null) },
        { n: '🐷 Alcancía', f: () => window.initDrag('monedas', '🪙', 't-bandeja', '🐷') }
    ]},
    'sub': { title: 'Retos de Resta', color: 'c-sub', games: [
        { n: '👹 Monstruo', f: () => window.initDragSub('🍪', 't-tazon', '👹') },
        { n: '🛸 Nave Espacial', f: () => window.initDragSub('👽', 't-bandeja', '🛸') },
        { n: '🎈 Pinchando Globos', f: () => window.initDestroy('🎈') },
        { n: '🧹 Borrador Mágico', f: () => window.initDestroy('🟤') }
    ]},
    'mul': { title: 'Retos de Multiplicación', color: 'c-mul', games: [
        { n: '⚡ Clonador', f: () => window.initCloner() },
        { n: '🏭 Fábrica', f: () => window.initGrid() },
        { n: '🎁 Regalos', f: () => window.initDragMul('Moños', '🎀', 't-regalo', null) },
        { n: '🥚 Nidos', f: () => window.initDragMul('Huevos', '🥚', 't-nido', null) }
    ]},
    'div': { title: 'Retos de División', color: 'c-div', games: [
        { n: '🍽️ Platos', f: () => window.initDragDiv('Joyas', '💎', 't-plato', null) },
        { n: '💰 Cofres', f: () => window.initDragDiv('Monedas', '🪙', 't-cofre', null) },
        { n: '🐶 Perritos', f: () => window.initDragDiv('Huesos', '🦴', 't-tazon', '🐶') },
        { n: '🏀 Canastas', f: () => window.initDragDiv('Balones', '🏀', 't-canasta', null) }
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
