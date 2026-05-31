/**
 * game-logic.js 
 * ─────────────────────────────────────────────────────────
 * Motor interactivo de mini-juegos matemáticos adaptados para TDAH.
 * V7: Instrucciones de Multiplicación basadas en retos lógicos, no en guías directas.
 */

import { guardarEstrellas } from './auth-manager.js';

/* ── Estado local del mini-juego en curso ── */
let gameState = {};
let dragged   = null;
let ox = 0, oy = 0;

const randomMsg = msgs => msgs[Math.floor(Math.random() * msgs.length)];

/* ══════════════════════════════════════════════════════════
   DRAG & DROP (CON HOOKS DE ESTADO DINÁMICO)
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
    el.addEventListener('pointerup',    release);
    el.addEventListener('pointercancel', release);
}

function hit(x, y, el) {
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

/* ══════════════════════════════════════════════════════════
   HELPERS DE INTERFAZ
══════════════════════════════════════════════════════════ */
function setupUI(msg) {
    document.getElementById('game-instr').innerHTML = msg;
    document.getElementById('game-top').innerHTML   = '';
    document.getElementById('game-bot').innerHTML   = '';
    gameState = { targets: [] };
    window.AppUX?.onNewInstruction?.(msg);
}

function createTargetNode(tClass, icon, customLabel = "") {
    const wrap = document.createElement('div');
    wrap.className = 'target-wrap';
    wrap.style.transition = "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    
    if (icon) {
        const ico = document.createElement('div');
        ico.className = 'target-icon';
        ico.innerText = icon;
        wrap.appendChild(ico);
    }
    
    const drop = document.createElement('div');
    drop.className = `target ${tClass}`;
    if (customLabel) {
        drop.setAttribute('data-label', customLabel);
    }
    wrap.appendChild(drop);
    return { wrap, drop };
}

function createDraggables(count, emoji, isGroup = false, perGroup = 1) {
    const bot = document.getElementById('game-bot');
    for (let i = 0; i < count; i++) {
        const item = document.createElement('div');
        item.className = 'drag-item';
        
        if (isGroup) {
            item.innerText = emoji.repeat(perGroup);
            item.style.cssText = 'width:auto; min-width:55px; padding:0 8px; border-radius:12px; background:rgba(255,255,255,0.7); border:2px dashed #94A3B8; font-size:1.8rem;';
        } else {
            item.innerText = emoji;
        }
        
        const randomScale = 0.96 + Math.random() * 0.08;
        item.style.transform = `scale(${randomScale})`;
        
        dragify(item, (x, y, el) => {
            let dropped = false;
            gameState.targets.forEach(td => {
                if (!dropped && hit(x, y, td.drop)) {
                    dropped = true;
                    td.drop.appendChild(el);
                    td.wrap.style.transform = "scale(1.06)";
                    setTimeout(() => td.wrap.style.transform = "scale(1)", 140);
                    
                    if (gameState.onItemDropped) gameState.onItemDropped(td.drop);
                }
            });
            if (!dropped) document.getElementById('game-bot')?.appendChild(el);
        });
        bot.appendChild(item);
    }
}

/* ══════════════════════════════════════════════════════════
   MINI-JUEGOS DINÁMICOS
══════════════════════════════════════════════════════════ */

/* ── 1. SUMA DINÁMICA (1, 2 o 3 Cajas) ── */
function initDrag(name, emoji, tClass, icon) {
    const targetCount = Math.floor(Math.random() * 5) + 3;
    const boxesMode = Math.floor(Math.random() * 3) + 1; 

    const top = document.getElementById('game-top');
    
    if (boxesMode === 1) {
        setupUI(`🎯 Pon exactamente <b>${targetCount}</b> ${name} en el objetivo.`);
        const td = createTargetNode(tClass, icon);
        top.appendChild(td.wrap);
        gameState.targets.push(td);
        
        window.checkLogic = () => {
            const count = td.drop.querySelectorAll('.drag-item').length;
            if (count === targetCount) misionCumplida(`¡Guardaste los ${targetCount} elementos correctamente!`);
            else Effects.fail(`Hay ${count}. Se exigen exactamente ${targetCount}.`);
        };
    } else if (boxesMode === 2) {
        const p1 = Math.floor(targetCount / 2) + 1;
        const p2 = targetCount - p1;
        setupUI(`🛸 ¡Suma Dividida! Pon <b>${p1}</b> en la caja A y <b>${p2}</b> en la B para lograr <b>${targetCount}</b>.`);
        const td1 = createTargetNode(tClass, icon, "Zona A");
        const td2 = createTargetNode(tClass, icon || "⚡", "Zona B");
        top.appendChild(td1.wrap); top.appendChild(td2.wrap);
        gameState.targets.push(td1, td2);
        
        window.checkLogic = () => {
            const c1 = td1.drop.querySelectorAll('.drag-item').length;
            const c2 = td2.drop.querySelectorAll('.drag-item').length;
            if (c1 === p1 && c2 === p2) misionCumplida(`¡Perfecto! ${c1} + ${c2} = ${targetCount}.`);
            else Effects.fail(`Zona A requiere ${p1} y Zona B requiere ${p2}.`);
        };
    } else {
        const p1 = Math.floor(targetCount / 3) + 1;
        const p2 = Math.floor(targetCount / 3);
        const p3 = targetCount - p1 - p2;
        setupUI(`🚀 ¡Tri-Suma! Reparte <b>${targetCount}</b> ${name} así: <b>${p1}</b> en A, <b>${p2}</b> en B y <b>${p3}</b> en C.`);
        const td1 = createTargetNode(tClass, icon, "Zona A");
        const td2 = createTargetNode(tClass, icon, "Zona B");
        const td3 = createTargetNode(tClass, icon, "Zona C");
        top.appendChild(td1.wrap); top.appendChild(td2.wrap); top.appendChild(td3.wrap);
        gameState.targets.push(td1, td2, td3);

        window.checkLogic = () => {
            const c1 = td1.drop.querySelectorAll('.drag-item').length;
            const c2 = td2.drop.querySelectorAll('.drag-item').length;
            const c3 = td3.drop.querySelectorAll('.drag-item').length;
            if (c1 === p1 && c2 === p2 && c3 === p3) misionCumplida(`¡Triple acierto! ${c1} + ${c2} + ${c3} = ${targetCount}.`);
            else Effects.fail(`Revisa las zonas. A pide ${p1}, B pide ${p2} y C pide ${p3}.`);
        };
    }
    createDraggables(targetCount + 3, emoji);
}

/* ── 2. RESTA FÍSICA (La Papelera) ── */
function initDragSub(emoji, tClass, icon) {
    const total = Math.floor(Math.random() * 5) + 6; 
    const toSub = Math.floor(Math.random() * 4) + 2; 
    const tgt   = total - toSub;

    setupUI(`🗑️ Tienes <b>${total}</b> unidades. Arrastra las necesarias al contenedor de descarte para que te queden <b>${tgt}</b> a salvo.`);
    
    const td = createTargetNode('t-tazon', '🗑️', 'Descarte');
    td.drop.style.borderColor = "#DC2626";
    td.drop.style.background = "#FEE2E2";
    
    document.getElementById('game-top').appendChild(td.wrap);
    gameState.targets.push(td);
    createDraggables(total, emoji);

    window.checkLogic = () => {
        const inBin = td.drop.querySelectorAll('.drag-item').length;
        const left = document.getElementById('game-bot').querySelectorAll('.drag-item').length;
        
        if (inBin === toSub && left === tgt) misionCumplida(`¡Resta física exitosa! ${total} - ${toSub} = ${tgt}.`);
        else Effects.fail(`Has descartado ${inBin} y quedaron ${left}. Debes lograr que queden exactamente ${tgt}.`);
    };
}

/* ── 3. DESTRUCCIÓN (Resta Visual Rápida) ── */
function initDestroy(emoji) {
    const total = Math.floor(Math.random() * 5) + 7;
    const toSub = Math.floor(Math.random() * 4) + 2;
    const tgt   = total - toSub;

    setupUI(`👾 Hay <b>${total}</b> invasores. Haz clic sobre los necesarios para eliminarlos y dejar solo <b>${tgt}</b> vivos.`);
    const bot = document.getElementById('game-bot');
    gameState.destroyed = 0;

    for (let i = 0; i < total; i++) {
        const item = document.createElement('div');
        item.className = 'click-item';
        item.innerText = emoji;
        item.style.transition = "transform 0.15s ease-out, opacity 0.15s ease-out";
        const rot = Math.floor(Math.random() * 60) - 30;
        item.style.transform = `scale(1) rotate(${rot}deg)`;
        
        item.onclick = () => {
            if (!item.classList.contains('destroyed')) {
                item.style.transform = 'scale(0) rotate(180deg)';
                item.classList.add('destroyed');
                gameState.destroyed++;
                window.Effects?.playTone?.(350 + (gameState.destroyed * 30), 0.06, 'triangle', 0.05);
            }
        };
        bot.appendChild(item);
    }

    window.checkLogic = () => {
        const left = total - gameState.destroyed;
        if (left === tgt) misionCumplida(`¡Defensa perfecta! Destruiste ${toSub} elementos.`);
        else if (left > tgt) Effects.fail(`Quedan ${left}. Tienen que quedar ${tgt}.`);
        else Effects.fail(`¡Destruiste demasiados! Quedaron ${left} y la meta era ${tgt}.`);
    };
}

/* ── 4. CLONADOR (Multiplicación Aditiva Orientada a Retos) ── */
function initCloner() {
    const grp = Math.floor(Math.random() * 3) + 2; // Produce 2, 3 o 4 por clic
    const tms = Math.floor(Math.random() * 4) + 2; // Clics necesarios: 2 a 5
    const totalMeta = grp * tms;
    
    const frases = [
        `🌀 ¡Reto de Clonación! Necesitamos exactamente <b>${totalMeta}</b> superestrellas. Cada cápsula genera <b>${grp}</b>. ¡Calcula y lanza las cápsulas necesarias!`,
        `⚙️ ¡Se requiere <b>${totalMeta}</b> de energia! El clonador produce grupos de a <b>${grp}</b>. ¿Cuántos grupos necesitas crear para llegar a la meta?`,
        `🛸 ¡Misión Cuántica! Alcanza un total de <b>${totalMeta}</b> estrellas usando el clonador, sabiendo que produce grupos de a <b>${grp}</b>. ¡Calcula bien la respuesta!`
    ];

    setupUI(randomMsg(frases));
    
    const bot = document.getElementById('game-bot');
    const top = document.getElementById('game-top');
    gameState.cloned = 0;

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'width:100%; display:flex; justify-content:center; align-items:center; flex-direction:column; gap: 10px;';

    const btn = document.createElement('button');
    btn.className = 'btn-check';
    btn.innerText = '⚡ Lanzar Cápsula';
    btn.style.cssText = 'background:var(--warning); width:auto; box-shadow:0 4px 0 var(--warning-shadow); padding:10px 20px; font-size:1.15rem;';

    btn.onclick = () => {
        gameState.cloned++;
        const g = document.createElement('div');
        g.className = 'target t-caja';
        g.style.cssText = 'height:auto; font-size:1.8rem; padding:6px; min-width:90px; animation: popIn 0.2s ease both;';
        g.innerText = '⭐'.repeat(grp);
        top.appendChild(g);
        window.Effects?.playTone?.(440 + (gameState.cloned * 25), 0.08, 'sine', 0.06);
    };

    btnContainer.appendChild(btn);
    bot.appendChild(btnContainer);

    window.checkLogic = () => {
        const currentTotal = gameState.cloned * grp;
        if (currentTotal === totalMeta) {
            misionCumplida(`¡Cálculo perfecto! ${gameState.cloned} cápsulas de ${grp} suman ${totalMeta}.`);
        } else if (currentTotal < totalMeta) {
            Effects.fail(`Tienes ${currentTotal}. Aún te faltan para llegar a ${totalMeta}.`);
        } else {
            Effects.fail(`¡Te pasaste! Generaste ${currentTotal} y la meta era solo ${totalMeta}.`);
        }
    };
}

/* ── 5. FÁBRICA GRID ── */
function initGrid() {
    const rows = Math.floor(Math.random() * 3) + 2; 
    const cols = Math.floor(Math.random() * 3) + 2; 

    setupUI(`🏭 Calibra la red de energía. Debe medir exactamente <b>${rows}</b> filas y <b>${cols}</b> columnas.`);
    
    const top = document.getElementById('game-top');
    const bot = document.getElementById('game-bot');
    
    const grid = document.createElement('div');
    grid.className = 'grid-machine';
    top.appendChild(grid);

    gameState.r = Math.floor(Math.random() * 4) + 1; 
    gameState.c = Math.floor(Math.random() * 4) + 1; 

    const updateGrid = () => {
        grid.style.gridTemplateColumns = `repeat(${gameState.c}, 1fr)`;
        grid.innerHTML = '';
        for (let i = 0; i < gameState.r * gameState.c; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            grid.appendChild(cell);
        }
    };

    const bRowPlus  = document.createElement('button'); bRowPlus.className='btn-check'; bRowPlus.innerText='➕ Fila'; bRowPlus.style.cssText='width:22%; margin:0; font-size:1rem; padding:8px; box-shadow:0 4px 0 var(--primary-shadow);';
    const bRowMinus = document.createElement('button'); bRowMinus.className='btn-reset'; bRowMinus.innerText='➖ Fila'; bRowMinus.style.cssText='width:22%; margin:0; font-size:1rem; padding:8px; box-shadow:0 4px 0 #475569; background:#64748B;';
    const bColPlus  = document.createElement('button'); bColPlus.className='btn-check'; bColPlus.innerText='➕ Col';  bColPlus.style.cssText='width:22%; margin:0; font-size:1rem; padding:8px; box-shadow:0 4px 0 var(--primary-shadow);';
    const bColMinus = document.createElement('button'); bColMinus.className='btn-reset'; bColMinus.innerText='➖ Col';  bColMinus.style.cssText='width:22%; margin:0; font-size:1rem; padding:8px; box-shadow:0 4px 0 #475569; background:#64748B;';

    bRowPlus.onclick  = () => { if (gameState.r < 5) { gameState.r++; updateGrid(); window.Effects?.playTone?.(500, 0.05); } };
    bRowMinus.onclick = () => { if (gameState.r > 1) { gameState.r--; updateGrid(); window.Effects?.playTone?.(300, 0.05); } };
    bColPlus.onclick  = () => { if (gameState.c < 5) { gameState.c++; updateGrid(); window.Effects?.playTone?.(600, 0.05); } };
    bColMinus.onclick = () => { if (gameState.c > 1) { gameState.c--; updateGrid(); window.Effects?.playTone?.(400, 0.05); } };

    const bContainer = document.createElement('div');
    bContainer.style.cssText = 'display:flex; gap:8px; width:100%; justify-content:center; flex-wrap:wrap;';
    
    bContainer.appendChild(bRowPlus); bContainer.appendChild(bRowMinus); bContainer.appendChild(bColPlus); bContainer.appendChild(bColMinus);
    bot.appendChild(bContainer);
    updateGrid();

    window.checkLogic = () => {
        if (gameState.r === rows && gameState.c === cols) misionCumplida(`¡Red calibrada a ${rows} x ${cols}!`);
        else Effects.fail(`Mide ${gameState.r}x${gameState.c}. El regulador requiere de ${rows}x${cols}.`);
    };
}

/* ── 6. MULTIPLICACIÓN (Arrastre por Grupos Ensamblados) ── */
function initDragMul(name, emoji, tClass, icon) {
    const mode = Math.random() > 0.5 ? 'partitive' : 'groups';
    
    if (mode === 'partitive') {
        const groups   = Math.floor(Math.random() * 3) + 2; 
        const perGroup = Math.floor(Math.random() * 3) + 2; 
        setupUI(`📦 Necesitamos un total de <b>${groups * perGroup}</b> ${name}. Llena las <b>${groups}</b> cajas colocando exactamente la misma cantidad en cada una.`);

        for (let i = 0; i < groups; i++) {
            const targetData = createTargetNode(tClass, icon, `Caja ${i+1}`);
            document.getElementById('game-top').appendChild(targetData.wrap);
            gameState.targets.push(targetData);
        }
        createDraggables(groups * perGroup + 2, emoji);

        window.checkLogic = () => {
            const allOk = gameState.targets.every(td => td.drop.querySelectorAll('.drag-item').length === perGroup);
            if (allOk) misionCumplida(`¡${groups} cajas con ${perGroup} suman ${groups * perGroup}!`);
            else Effects.fail(`Debes poner exactamente ${perGroup} elementos en cada una.`);
        };
    } else {
        const groups   = Math.floor(Math.random() * 3) + 2; 
        const perGroup = Math.floor(Math.random() * 2) + 2; 
        setupUI(`📦 Logística: Arrastra exactamente <b>${groups}</b> paquetes (cada paquete contiene <b>${perGroup}</b>) a la base central.`);
        
        const td = createTargetNode('t-bandeja', icon, "Base de Carga");
        document.getElementById('game-top').appendChild(td.wrap);
        gameState.targets.push(td);

        createDraggables(groups + 3, emoji, true, perGroup);

        window.checkLogic = () => {
            const packages = td.drop.querySelectorAll('.drag-item').length;
            if (packages === groups) misionCumplida(`¡Logística perfecta! ${groups} paquetes de ${perGroup} son ${groups * perGroup}.`);
            else Effects.fail(`Hay ${packages} paquetes en la base. Deben ser exactamente ${groups}.`);
        };
    }
}

/* ── 7. DIVISIÓN (La Máquina Empaquetadora Cuotativa) ── */
function initDragDiv(name, emoji, tClass, icon) {
    const mode = Math.random() > 0.4 ? 'machine' : 'share';

    const groups   = Math.floor(Math.random() * 3) + 2; 
    const perGroup = Math.floor(Math.random() * 3) + 2; 
    const total    = groups * perGroup;

    if (mode === 'share') {
        setupUI(`⚖️ Tienes <b>${total}</b> ${name}. Repártelos en partes exactamente iguales entre las <b>${groups}</b> estaciones.`);
        for (let i = 0; i < groups; i++) {
            const targetData = createTargetNode(tClass, icon, `Est. ${i+1}`);
            document.getElementById('game-top').appendChild(targetData.wrap);
            gameState.targets.push(targetData);
        }
        createDraggables(total, emoji);

        window.checkLogic = () => {
            let sum = 0;
            gameState.targets.forEach(td => sum += td.drop.querySelectorAll('.drag-item').length);
            if (sum !== total) return Effects.fail(`¡Faltan piezas por repartir!`); 
            
            const first = gameState.targets[0].drop.querySelectorAll('.drag-item').length;
            const allEq = gameState.targets.every(td => td.drop.querySelectorAll('.drag-item').length === first);
            if (allEq) misionCumplida(`¡División equitativa! ${total} ÷ ${groups} = ${first}.`);
            else Effects.fail(`Hay estaciones desiguales. Mantén las cantidades parejas.`);
        };
    } else {
        setupUI(`⚙️ La Máquina: Tienes <b>${total}</b> ${name}. Arrástralos hacia la máquina. Cada vez que detecte <b>${perGroup}</b>, fabricará una caja sellada.`);
        
        const top = document.getElementById('game-top');
        const machineNode = createTargetNode('t-pecera', '⚙️', 'Empaquetadora');
        machineNode.drop.style.borderColor = "var(--purple)";
        top.appendChild(machineNode.wrap);
        gameState.targets.push(machineNode);

        const warehouse = document.createElement('div');
        warehouse.style.cssText = 'display:flex; gap:8px; margin-top:15px; width:100%; justify-content:center; flex-wrap:wrap;';
        top.appendChild(warehouse);

        gameState.packedBoxes = 0;

        gameState.onItemDropped = (dropZone) => {
            if (dropZone === machineNode.drop) {
                const currentItems = dropZone.querySelectorAll('.drag-item');
                if (currentItems.length === perGroup) {
                    dropZone.innerHTML = ''; 
                    gameState.packedBoxes++;
                    
                    const box = document.createElement('div');
                    box.className = 'target t-caja';
                    box.style.cssText = 'min-width:70px; min-height:50px; background:var(--success); color:#fff; display:flex; align-items:center; justify-content:center; border-radius:12px; font-size:1.5rem; border:none; animation: popIn 0.3s;';
                    box.innerText = '📦';
                    warehouse.appendChild(box);
                    
                    window.Effects?.playTone?.(650, 0.15, 'triangle', 0.1);
                }
            }
        };

        createDraggables(total, emoji);

        window.checkLogic = () => {
            const leftOver = document.getElementById('game-bot').querySelectorAll('.drag-item').length;
            const inMachine = machineNode.drop.querySelectorAll('.drag-item').length;
            
            if (leftOver === 0 && inMachine === 0 && gameState.packedBoxes === groups) {
                misionCumplida(`¡Fabricación completa! ${total} ÷ ${perGroup} te dio ${groups} cajas.`);
            } else {
                Effects.fail(`Aún tienes piezas sueltas sin empaquetar.`);
            }
        };
    }
}

function misionCumplida(mensaje) {
    if (window.Effects?.win) window.Effects.win(mensaje);
    try { guardarEstrellas(1); } catch (e) { console.warn(e); }
}

window.initDrag       = initDrag;
window.initDragSub    = initDragSub;
window.initDragMul    = initDragMul;
window.initDragDiv    = initDragDiv;
window.initDestroy    = initDestroy;
window.initCloner     = initCloner;
window.initGrid       = initGrid;
window.misionCumplida = misionCumplida;
window.checkLogic     = null;