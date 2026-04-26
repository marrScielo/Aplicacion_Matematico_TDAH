const DB = {
    'add': { title: 'Retos de Suma', color: 'c-add', games: [
        { n: '📦 Caja Mágica', f: () => initDrag('manzanas', '🍎', 't-caja', null) },
        { n: '🐟 Pecera', f: () => initDrag('peces', '🐟', 't-pecera', null) },
        { n: '🎒 Mochila', f: () => initDrag('lápices', '✏️', 't-mochila', null) },
        { n: '🐷 Alcancía', f: () => initDrag('monedas', '🪙', 't-bandeja', '🐷') }
    ]},
    'sub': { title: 'Retos de Resta', color: 'c-sub', games: [
        { n: '👹 Monstruo', f: () => initDragSub('🍪', 't-tazon', '👹') },
        { n: '🛸 Nave Espacial', f: () => initDragSub('👽', 't-bandeja', '🛸') },
        { n: '🎈 Pinchando Globos', f: () => initDestroy('🎈') },
        { n: '🧹 Borrador Mágico', f: () => initDestroy('🟤') }
    ]},
    'mul': { title: 'Retos de Multiplicación', color: 'c-mul', games: [
        { n: '⚡ Clonador', f: initCloner },
        { n: '🏭 Fábrica', f: initGrid },
        { n: '🎁 Regalos', f: () => initDragMul('Moños', '🎀', 't-regalo', null) },
        { n: '🥚 Nidos', f: () => initDragMul('Huevos', '🥚', 't-nido', null) }
    ]},
    'div': { title: 'Retos de División', color: 'c-div', games: [
        { n: '🍽️ Platos', f: () => initDragDiv('Joyas', '💎', 't-plato', null) },
        { n: '💰 Cofres', f: () => initDragDiv('Monedas', '🪙', 't-cofre', null) },
        { n: '🐶 Perritos', f: () => initDragDiv('Huesos', '🦴', 't-tazon', '🐶') },
        { n: '🏀 Canastas', f: () => initDragDiv('Balones', '🏀', 't-canasta', null) }
    ]}
};

document.addEventListener('DOMContentLoaded', () => {
    // Eventos Globales
    document.getElementById('btn-back').onclick = () => Navigation.back();
    document.getElementById('btn-reset').onclick = () => Effects.resetLevel();
    document.getElementById('btn-check').onclick = () => { if(checkLogic) checkLogic(); };
    document.getElementById('btn-next').onclick = () => Navigation.restartGame();
    document.getElementById('btn-result-next').onclick = () => { Navigation.restartGame(); Navigation.goTo('screen-game'); };
    document.getElementById('btn-result-menu').onclick = () => Navigation.goTo('screen-sub');
    Effects.attachGlobalClickSound();
    
    // Eventos del Menú Principal
    document.querySelectorAll('.btn-menu[data-op]').forEach(btn => {
        btn.onclick = () => Navigation.showMenu(btn.dataset.op);
    });
});
