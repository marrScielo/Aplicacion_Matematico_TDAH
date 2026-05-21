/**
 * navigation.js — v2: integra pantallas de gamificación
 * Maneja: main, sub, game, result, profile, missions, shop
 */

const Navigation = {
    screens: [
        'screen-main', 'screen-sub', 'screen-game', 'screen-result',
        'screen-profile', 'screen-missions', 'screen-shop'
    ],

    /* ── Cambiar pantalla ─────────────────────────── */
    goTo(id) {
        this.screens.forEach(s => {
            const el = document.getElementById(s);
            if (el) el.classList.remove('active');
        });

        const target = document.getElementById(id);
        if (target) {
            target.classList.add('active');
            target.scrollTop = 0;
        }

        const btnBack = document.getElementById('btn-back');
        if (btnBack) btnBack.style.display = (id === 'screen-main') ? 'none' : 'flex';

        if (window.AppUX?.setFocusMode) {
            window.AppUX.setFocusMode(id === 'screen-game');
        }

        /* Actualizar nav inferior */
        document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === id);
        });

        /* Renderizar pantallas especiales al entrar */
        if (id === 'screen-profile')  window.GM?.renderProfile?.();
        if (id === 'screen-missions') window.GM?.renderMissions?.();
        if (id === 'screen-shop')     window.GM?.renderShop?.();
    },

    /* ── Botón "Volver" ───────────────────────────── */
    back() {
        const active = document.querySelector('.screen.active');
        if (!active) { this.goTo('screen-main'); return; }

        switch (active.id) {
            case 'screen-game':
                if (window.GS.questionsInBlock > 0 && !window.GS.isBlockComplete()) {
                    const ok = confirm('¿Salir? Perderás el progreso de este bloque.');
                    if (!ok) return;
                    window.GS.questionsInBlock = 0;
                }
                this.goTo('screen-sub');
                break;
            case 'screen-result':
                this.goTo('screen-sub');
                break;
            case 'screen-sub':
                this.goTo('screen-main');
                break;
            default:
                this.goTo('screen-main');
        }
    },

    /* ── Mostrar submenú de juegos ────────────────── */
    showMenu(op) {
        const d = window.DB?.[op];
        if (!d) { console.error('[Nav] DB no listo para:', op); return; }

        const subTitle = document.getElementById('sub-title');
        if (subTitle) { subTitle.innerText = d.title; subTitle.className = d.color; }

        const list = document.getElementById('sub-list');
        if (!list) return;
        list.innerHTML = '';

        d.games.forEach((game, idx) => {
            const gameId  = `${op}-${idx}`;
            const isDone  = window.GS.isDone(gameId);

            const btn = document.createElement('button');
            btn.dataset.gameId = gameId;

            if (isDone) {
                btn.className = `btn-menu ${d.color} btn-done`;
                btn.disabled  = true;
                btn.innerHTML = `
                    <span class="btn-emoji" aria-hidden="true">✅</span>
                    <span class="btn-label">${game.n}</span>
                    <span class="btn-done-badge">¡Completado!</span>`;
            } else {
                btn.className = `btn-menu ${d.color}`;
                btn.innerHTML = `
                    <span class="btn-emoji" aria-hidden="true">${game.n.split(' ')[0]}</span>
                    <span class="btn-label">${game.n.split(' ').slice(1).join(' ')}</span>`;
                btn.onclick = () => this._launchGame(gameId, game.f);
            }

            list.appendChild(btn);
        });

        this.goTo('screen-sub');
    },

    /* ── Lanzar un juego ──────────────────────────── */
    _launchGame(gameId, initFn) {
        window.GS.startBlock(gameId, initFn);
        if (window.AppUX?.startBlock) window.AppUX.startBlock();
        if (window.Effects?.clear) window.Effects.clear();
        initFn();
        this.goTo('screen-game');
    },

    /* ── Siguiente pregunta dentro del mismo bloque ── */
    nextQuestion() {
        if (!window.GS.currentInitFunc) {
            console.error('[Nav] Sin función de juego activa');
            return;
        }
        if (window.Effects?.clear) window.Effects.clear();
        window.GS.currentInitFunc();
    },

    /* ── Ir a pantalla de resultado ───────────────── */
    showResult() {
        window.GS.markCurrentDone();

        /* Guardar progreso en Firebase */
        window.AuthManager?.saveProgress?.();

        const btn = document.querySelector(`[data-game-id="${window.GS.currentGameId}"]`);
        if (btn) {
            btn.classList.add('btn-done');
            btn.disabled  = true;
            const lbl = btn.querySelector('.btn-label');
            btn.innerHTML = `
                <span class="btn-emoji" aria-hidden="true">✅</span>
                <span class="btn-label">${lbl ? lbl.textContent : ''}</span>
                <span class="btn-done-badge">¡Completado!</span>`;
        }

        this.goTo('screen-result');
    }
};

window.Navigation = Navigation;
