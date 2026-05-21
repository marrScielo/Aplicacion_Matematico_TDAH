/**
 * game-logic.js  (ES module)
 * ─────────────────────────────────────────────────────────
 * Lógica de cada mini-juego. No guarda estado de navegación.
 *
 * CAMBIOS RESPECTO A LA VERSIÓN ANTERIOR:
 *  1. Eliminadas: `let currentInitFunc`, `let checkLogic` locales.
 *     → Ambas ahora viven en window.GS y window.checkLogic.
 *  2. window.points eliminado → window.GS.totalPoints.
 *  3. misionCumplida() ya no llama Effects.win() directamente:
 *     eso lo hace cada checkLogic individual.
 *     misionCumplida ES Effects.win (alias semántico).
 *  4. resetLevel en effects-qa.js llama window.GS.currentInitFunc,
 *     así que cada init ya no necesita guardarse a sí misma.
 */

import { guardarEstrellas } from './auth-manager.js';

/* ── Estado local del mini-juego en curso ── */
let gameState = {};
let dragged   = null;
let ox = 0, oy = 0;

const randomMsg = msgs => msgs[Math.floor(Math.random() * msgs.length)];

/* ══════════════════════════════════════════════════════════
   DRAG & DROP
══════════════════════════════════════════════════════════ */
function dragify(el, onDrop) {
    el.addEventListener('pointerdown', e => {
        e.preventDefault();
        dragged   = el;
        el.dropCb = onDrop;
        const r   = el.getBoundingClientRect();
        ox = e.clientX - r.left;
        oy = e.clientY - r.top;
        el.style.cssText += `width:${r.width}px;height:${r.height}px;position:absolute;left:${e.clientX-ox}px;top:${e.clientY-oy}px;`;
        document.body.appendChild(el);
        el.classList.add('dragging');
        el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', e => {
        if (dragged === el) {
            el.style.left = (e.clientX - ox) + 'px';
            el.style.top  = (e.clientY - oy) + 'px';
        }
    });

    const release = e => {
        if (dragged !== el) return;
        el.releasePointerCapture(e.pointerId);
        if (el.dropCb) el.dropCb(e.clientX, e.clientY, el);
        if (el.parentNode === document.body) {
            document.getElementById('game-bot')?.appendChild(el);
        }
        el.classList.remove('dragging');
        el.style.cssText = el.style.cssText
            .replace(/position:[^;]+;?/g,'')
            .replace(/left:[^;]+;?/g,'')
            .replace(/top:[^;]+;?/g,'')
            .replace(/width:[^;]+;?/g,'')
            .replace(/height:[^;]+;?/g,'');
        el.style.position = 'relative';
        dragged = null;
    };
    el.addEventListener('pointerup',     release);
    el.addEventListener('pointercancel', release);
}

function hit(x, y, el) {
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

/* ══════════════════════════════════════════════════════════
   HELPERS DE UI
══════════════════════════════════════════════════════════ */
function setupUI(msg) {
    document.getElementById('game-instr').innerHTML = msg;
    document.getElementById('game-top').innerHTML   = '';
    document.getElementById('game-bot').innerHTML   = '';
    gameState = { targets: [] };
    window.AppUX?.onNewInstruction?.(msg);
}

function createTargetNode(tClass, icon) {
    const wrap = document.createElement('div');
    wrap.className = 'target-wrap';
    if (icon) {
        const ico = document.createElement('div');
        ico.className = 'target-icon';
        ico.innerText = icon;
        wrap.appendChild(ico);
    }
    const drop = document.createElement('div');
    drop.className = `target ${tClass}`;
    wrap.appendChild(drop);
    return { wrap, drop };
}

function createDraggables(count, emoji) {
    const bot = document.getElementById('game-bot');
    for (let i = 0; i < count; i++) {
        const item = document.createElement('div');
        item.className = 'drag-item';
        item.innerText = emoji;
        dragify(item, (x, y, el) => {
            let dropped = false;
            gameState.targets.forEach(td => {
                if (!dropped && hit(x, y, td.drop)) {
                    dropped = true;
                    td.drop.appendChild(el);
                }
            });
            if (!dropped) document.getElementById('game-bot')?.appendChild(el);
        });
        bot.appendChild(item);
    }
}

/* ══════════════════════════════════════════════════════════
   MINI-JUEGOS
══════════════════════════════════════════════════════════ */

/* ── Arrastrar para sumar ── */
function initDrag(name, emoji, tClass, icon) {
    const t = Math.floor(Math.random() * 4) + 4;
    setupUI(randomMsg([
        `🎯 ¡Misión! Pon exactamente <b>${t}</b> ${name} en la zona.`,
        `🚀 Arrastra <b>${t}</b> ${name} al destino.`
    ]));
    const td = createTargetNode(tClass, icon);
    document.getElementById('game-top').appendChild(td.wrap);
    gameState.targets.push(td);
    createDraggables(t + 4, emoji);

    window.checkLogic = () => {
        const count = td.drop.querySelectorAll('.drag-item').length;
        if (count === t) misionCumplida(`¡Pusiste ${t} ${name}!`);
        else             Effects.fail(`Hay ${count}. Necesitas exactamente ${t}.`);
    };
}

/* ── Arrastrar para restar ── */
function initDragSub(emoji, tClass, icon) {
    const total = Math.floor(Math.random() * 4) + 6;
    const toSub = Math.floor(Math.random() * 3) + 2;
    const tgt   = total - toSub;
    setupUI(`Empiezas con <b>${total}</b>. Deja solo <b>${tgt}</b> abajo.`);
    const td = createTargetNode(tClass, icon);
    document.getElementById('game-top').appendChild(td.wrap);
    gameState.targets.push(td);
    createDraggables(total, emoji);

    window.checkLogic = () => {
        const left = document.getElementById('game-bot').querySelectorAll('.drag-item').length;
        if (left === tgt) misionCumplida(`${total} − ${toSub} = ${tgt} ✓`);
        else              Effects.fail(`Quedan ${left}. Deben quedar ${tgt}.`);
    };
}

/* ── Destruir elementos ── */
function initDestroy(emoji) {
    const total = Math.floor(Math.random() * 4) + 6;
    const toSub = Math.floor(Math.random() * 3) + 2;
    const tgt   = total - toSub;
    setupUI(`Hay <b>${total}</b>. Toca los que sobran hasta que queden <b>${tgt}</b>.`);
    const bot = document.getElementById('game-bot');
    gameState.destroyed = 0;

    for (let i = 0; i < total; i++) {
        const item = document.createElement('div');
        item.className = 'click-item';
        item.innerText = emoji;
        item.onclick   = () => {
            if (!item.classList.contains('destroyed')) {
                item.style.transform = 'scale(0)';
                item.classList.add('destroyed');
                gameState.destroyed++;
            }
        };
        bot.appendChild(item);
    }

    window.checkLogic = () => {
        const left = total - gameState.destroyed;
        if (left === tgt) misionCumplida(`${total} − ${toSub} = ${tgt} ✓`);
        else              Effects.fail(`Quedan ${left}. ¡Faltan destruir más!`);
    };
}

/* ── Clonar grupos (multiplicación) ── */
function initCloner() {
    const grp = Math.floor(Math.random() * 2) + 2;
    const tms = Math.floor(Math.random() * 3) + 2;
    setupUI(`Clona <b>${tms}</b> veces el grupo de <b>${grp}</b> ⭐.`);
    const bot = document.getElementById('game-bot');
    gameState.cloned = 0;

    const btn = document.createElement('button');
    btn.className = 'btn-check';
    btn.innerText = '⚡ Clonar grupo';
    btn.onclick   = () => {
        gameState.cloned++;
        const g = document.createElement('div');
        g.className  = 'target t-caja clone-group';
        g.innerText  = '⭐'.repeat(grp);
        g.style.fontSize = '2.5rem';
        document.getElementById('game-top').appendChild(g);
    };
    bot.appendChild(btn);

    window.checkLogic = () => {
        if (gameState.cloned === tms) misionCumplida(`${grp} × ${tms} = ${grp * tms} ✓`);
        else                          Effects.fail(`Llevas ${gameState.cloned} clones. Necesitas ${tms}.`);
    };
}

/* ── Grid (multiplicación visual) ── */
function initGrid() {
    const rows = Math.floor(Math.random() * 2) + 2;
    const cols = Math.floor(Math.random() * 3) + 2;
    setupUI(`Construye una cuadrícula de <b>${rows}</b> filas × <b>${cols}</b> columnas.`);
    const top = document.getElementById('game-top');
    const bot = document.getElementById('game-bot');

    const grid = document.createElement('div');
    grid.className = 'grid-machine';
    top.appendChild(grid);

    gameState.r = 1;
    gameState.c = 1;

    const updateGrid = () => {
        grid.style.gridTemplateColumns = `repeat(${gameState.c}, 1fr)`;
        grid.innerHTML = '';
        for (let i = 0; i < gameState.r * gameState.c; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            grid.appendChild(cell);
        }
    };

    const bRow = document.createElement('button');
    bRow.className = 'btn-grid';
    bRow.innerText = '+ Fila';
    bRow.onclick   = () => { if (gameState.r < 6) { gameState.r++; updateGrid(); } };

    const bCol = document.createElement('button');
    bCol.className = 'btn-grid';
    bCol.innerText = '+ Columna';
    bCol.onclick   = () => { if (gameState.c < 6) { gameState.c++; updateGrid(); } };

    bot.appendChild(bRow);
    bot.appendChild(bCol);
    updateGrid();

    window.checkLogic = () => {
        if (gameState.r === rows && gameState.c === cols)
            misionCumplida(`${rows} × ${cols} = ${rows * cols} ✓`);
        else
            Effects.fail(`Tu cuadrícula es ${gameState.r}×${gameState.c}. Debe ser ${rows}×${cols}.`);
    };
}

/* ── Arrastrar para multiplicar ── */
function initDragMul(name, emoji, tClass, icon) {
    const groups   = Math.floor(Math.random() * 2) + 2;
    const perGroup = Math.floor(Math.random() * 2) + 2;
    setupUI(`Haz <b>${groups}</b> grupos de <b>${perGroup}</b> ${name}.`);

    for (let i = 0; i < groups; i++) {
        const td = createTargetNode(tClass, icon);
        document.getElementById('game-top').appendChild(td.wrap);
        gameState.targets.push(td);
    }
    createDraggables(groups * perGroup + 2, emoji);

    window.checkLogic = () => {
        const ok = gameState.targets.every(
            td => td.drop.querySelectorAll('.drag-item').length === perGroup
        );
        if (ok) misionCumplida(`${groups} × ${perGroup} = ${groups * perGroup} ✓`);
        else    Effects.fail('Revisa que cada grupo tenga la cantidad correcta.');
    };
}

/* ── Arrastrar para dividir ── */
function initDragDiv(name, emoji, tClass, icon) {
    const groups   = Math.floor(Math.random() * 2) + 2;
    const perGroup = Math.floor(Math.random() * 2) + 2;
    const total    = groups * perGroup;
    setupUI(`Reparte <b>${total}</b> ${name} de forma igual en <b>${groups}</b> zonas.`);

    for (let i = 0; i < groups; i++) {
        const td = createTargetNode(tClass, icon);
        document.getElementById('game-top').appendChild(td.wrap);
        gameState.targets.push(td);
    }
    createDraggables(total, emoji);

    window.checkLogic = () => {
        const counts = gameState.targets.map(
            td => td.drop.querySelectorAll('.drag-item').length
        );
        const sum   = counts.reduce((a, b) => a + b, 0);
        const allEq = counts.every(c => c === counts[0]);
        if (allEq && sum === total)
            misionCumplida(`${total} ÷ ${groups} = ${perGroup} ✓`);
        else
            Effects.fail('No están repartidos por igual o faltan piezas.');
    };
}


function misionCumplida(mensaje) {
    // Effects.win registra la respuesta en GS y decide si mostrar resultado
    if (window.Effects?.win) window.Effects.win(mensaje);

    // Guardar en Firebase de forma asíncrona (no bloquea la UI)
    try { guardarEstrellas(1); } catch (e) { console.warn('Firebase:', e); }
}

/* ── Exportar al scope global ── */
window.initDrag     = initDrag;
window.initDragSub  = initDragSub;
window.initDragMul  = initDragMul;
window.initDragDiv  = initDragDiv;
window.initDestroy  = initDestroy;
window.initCloner   = initCloner;
window.initGrid     = initGrid;
window.misionCumplida = misionCumplida;
window.checkLogic   = null;   // se sobreescribe al init de cada juego
