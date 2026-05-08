// Estado Global Interno
let points = 0;
let currentInitFunc = null; 
let checkLogic = null;
let gameState = {};
let dragged = null;
let ox = 0, oy = 0;

const randomMsg = (msgs) => msgs[Math.floor(Math.random() * msgs.length)];

function dragify(el, onDrop) {
    el.addEventListener('pointerdown', e => {
        e.preventDefault();
        dragged = el;
        el.dropCb = onDrop;
        let r = el.getBoundingClientRect();
        ox = e.clientX - r.left;
        oy = e.clientY - r.top;
        el.style.width = r.width + 'px';
        el.style.height = r.height + 'px';
        el.style.position = 'absolute';
        el.style.left = (e.clientX - ox) + 'px';
        el.style.top = (e.clientY - oy) + 'px';
        document.body.appendChild(el);
        el.classList.add('dragging');
        el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', e => {
        if(dragged === el) {
            el.style.left = (e.clientX - ox) + 'px';
            el.style.top = (e.clientY - oy) + 'px';
        }
    });

    const release = (e) => {
        if(dragged === el) {
            el.releasePointerCapture(e.pointerId);
            if(el.dropCb) el.dropCb(e.clientX, e.clientY, el);
            if(el.parentNode === document.body) {
                document.getElementById('game-bot').appendChild(el);
            }
            el.classList.remove('dragging');
            el.style.position = 'relative'; 
            el.style.left = ''; el.style.top = ''; el.style.width = ''; el.style.height = '';
            dragged = null;
        }
    };
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
}

function hit(x, y, el) { 
    let r = el.getBoundingClientRect(); return x>=r.left && x<=r.right && y>=r.top && y<=r.bottom;
}

function setupUI(msg) {
    document.getElementById('game-instr').innerHTML = msg; 
    document.getElementById('game-top').innerHTML = '';
    document.getElementById('game-bot').innerHTML = '';
    gameState = { targets: [] };

    if (window.AppUX && typeof window.AppUX.onNewInstruction === 'function') {
        window.AppUX.onNewInstruction(msg);
    }
}

function createTargetNode(tClass, icon) {
    let wrap = document.createElement('div'); wrap.className = 'target-wrap';
    if(icon) {
        let ico = document.createElement('div'); ico.className = 'target-icon'; ico.innerText = icon;
        wrap.appendChild(ico);
    }
    let drop = document.createElement('div'); drop.className = `target ${tClass}`;
    wrap.appendChild(drop);
    return { wrap: wrap, drop: drop };
}

function createDraggables(count, emoji) {
    let bot = document.getElementById('game-bot');
    for(let i=0; i<count; i++) {
        let item = document.createElement('div');
        item.className = 'drag-item'; item.innerText = emoji;
        dragify(item, (x,y,el) => {
            let dropped = false;
            gameState.targets.forEach(td => {
                if(!dropped && hit(x,y,td.drop)) {
                    dropped = true;
                    td.drop.appendChild(el); 
                }
            });
            if(!dropped) document.getElementById('game-bot').appendChild(el);
        });
        bot.appendChild(item);
    }
}

// LÓGICA DE JUEGOS ESPECÍFICOS
function initDrag(name, emoji, tClass, icon) {
    let t = Math.floor(Math.random()*4)+4; 
    setupUI(randomMsg([`¡Misión! Logra exactamente <b>${t}</b> ${name}.`]));
    let targetData = createTargetNode(tClass, icon);
    document.getElementById('game-top').appendChild(targetData.wrap); 
    gameState.targets.push(targetData);
    createDraggables(t+4, emoji); 
    window.checkLogic = () => {
        let count = gameState.targets[0].drop.querySelectorAll('.drag-item').length;
        if(count === t) Effects.win(`Lograste ${t}.`);
        else Effects.fail(`Hay ${count}, faltan/sobran.`);
    };
}

function initDragSub(emoji, tClass, icon) {
    let total = Math.floor(Math.random()*4)+6;
    let toSub = Math.floor(Math.random()*3)+2;
    let target = total - toSub;
    setupUI(`Empiezas con <b>${total}</b>. Deja solo <b>${target}</b> abajo.`);
    let targetData = createTargetNode(tClass, icon);
    document.getElementById('game-top').appendChild(targetData.wrap); 
    gameState.targets.push(targetData);
    createDraggables(total, emoji);
    window.checkLogic = () => {
        let currentLeft = document.getElementById('game-bot').querySelectorAll('.drag-item').length;
        if(currentLeft === target) Effects.win(`${total} - ${toSub} = ${target}.`);
        else Effects.fail(`Quedan ${currentLeft}. Deben quedar ${target}.`);
    };
}

function initDestroy(emoji) {
    let total = Math.floor(Math.random()*4)+6;
    let toSub = Math.floor(Math.random()*3)+2;
    let target = total - toSub;
    setupUI(`Hay <b>${total}</b>. Destruye hasta que queden <b>${target}</b>.`);
    let bot = document.getElementById('game-bot'); 
    gameState.destroyed = 0;
    for(let i=0; i<total; i++) {
        let item = document.createElement('div');
        item.className='click-item'; item.innerText=emoji;
        item.onclick = () => { 
            if(!item.classList.contains('destroyed')){
                item.style.transform='scale(0)'; item.classList.add('destroyed');
                gameState.destroyed++; 
            }
        };
        bot.appendChild(item);
    }
    window.checkLogic = () => {
        let currentLeft = total - gameState.destroyed;
        if(currentLeft === target) Effects.win(`${total} - ${toSub} = ${target}.`);
        else Effects.fail(`Quedan ${currentLeft}. ¡Faltan destruir!`);
    };
}

function initCloner() {
    let grp = Math.floor(Math.random()*2)+2, tms = Math.floor(Math.random()*3)+2;
    setupUI(`Clona <b>${tms}</b> veces el grupo de <b>${grp}</b>.`);
    let bot = document.getElementById('game-bot');
    let btn = document.createElement('button'); btn.className='btn-check'; btn.innerText='⚡ Clonar';
    gameState.cloned = 0;
    btn.onclick = () => {
        gameState.cloned++;
        let g = document.createElement('div'); g.className='target t-caja'; g.innerText='⭐'.repeat(grp);
        g.style.fontSize='3rem'; document.getElementById('game-top').appendChild(g);
    };
    bot.appendChild(btn);
    window.checkLogic = () => {
        if(gameState.cloned === tms) Effects.win(`${grp} x ${tms} = ${grp*tms}.`);
        else Effects.fail(`Llevas ${gameState.cloned}, faltan.`);
    };
}

function initGrid() {
    let rows = Math.floor(Math.random()*2)+2, cols = Math.floor(Math.random()*3)+2;
    setupUI(`Crea un bloque de <b>${rows}</b> filas y <b>${cols}</b> columnas.`);
    let grid = document.createElement('div'); grid.className='grid-machine'; 
    document.getElementById('game-top').appendChild(grid);
    gameState.r = 1; gameState.c = 1;
    let updateGrid = () => {
        grid.style.gridTemplateColumns = `repeat(${gameState.c}, 1fr)`; grid.innerHTML='';
        for(let i=0; i<gameState.r*gameState.c; i++) { let cell=document.createElement('div'); cell.className='grid-cell'; grid.appendChild(cell); }
    };
    let bRow = document.createElement('button'); bRow.className='btn-check'; bRow.innerText='+ Fila'; bRow.onclick=()=>{if(gameState.r<5) gameState.r++; updateGrid();};
    let bCol = document.createElement('button'); bCol.className='btn-check'; bCol.innerText='+ Col'; bCol.onclick=()=>{if(gameState.c<5) gameState.c++; updateGrid();};
    document.getElementById('game-bot').appendChild(bRow); document.getElementById('game-bot').appendChild(bCol);
    updateGrid();
    window.checkLogic = () => {
        if(gameState.r===rows && gameState.c===cols) Effects.win(`¡Perfecto! ${rows}x${cols}`);
        else Effects.fail(`Es ${gameState.r}x${gameState.c}.`);
    };
}

function initDragMul(name, emoji, tClass, icon) {
    let groups = Math.floor(Math.random()*2)+2, perGroup = Math.floor(Math.random()*2)+2;
    setupUI(`Haz <b>${groups}</b> grupos de <b>${perGroup}</b>.`);
    for(let i=0; i<groups; i++) {
        let td = createTargetNode(tClass, icon);
        document.getElementById('game-top').appendChild(td.wrap);
        gameState.targets.push(td);
    }
    createDraggables(groups*perGroup + 2, emoji);
    window.checkLogic = () => {
        let ok = gameState.targets.every(td => td.drop.querySelectorAll('.drag-item').length === perGroup);
        if(ok) Effects.win(`${groups} x ${perGroup}`);
        else Effects.fail(`Revisa las cantidades.`);
    };
}

function initDragDiv(name, emoji, tClass, icon) {
    let groups = Math.floor(Math.random()*2)+2, perGroup = Math.floor(Math.random()*2)+2, total = groups * perGroup;
    setupUI(`Reparte <b>${total}</b> equitativamente en <b>${groups}</b> zonas.`);
    for(let i=0; i<groups; i++) {
        let td = createTargetNode(tClass, icon);
        document.getElementById('game-top').appendChild(td.wrap);
        gameState.targets.push(td);
    }
    createDraggables(total, emoji);
    window.checkLogic = () => {
        let count = gameState.targets[0].drop.querySelectorAll('.drag-item').length;
        let ok = gameState.targets.every(td => td.drop.querySelectorAll('.drag-item').length === count);
        let sum = 0; gameState.targets.forEach(td => sum += td.drop.querySelectorAll('.drag-item').length);
        if(ok && sum === total) Effects.win(`${total} ÷ ${groups} = ${count}.`);
        else Effects.fail(`No están iguales o faltan piezas.`);
    };
}
// Al final de js/game-logic.js
window.initDrag = initDrag;
window.initDragSub = initDragSub;
window.initDragMul = initDragMul;
window.initDragDiv = initDragDiv;
window.initDestroy = initDestroy;
window.initCloner = initCloner;
window.initGrid = initGrid;

