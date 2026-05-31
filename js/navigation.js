/**
 * navigation.js — v4 Corregido
 * ─────────────────────────────────────────────────────────
 * - Maneja el renderizado de menús dinámicos dependientes de Firebase.
 * - Valida estados locales e interrupciones globales en tiempo real.
 */

const Navigation = {
    screens: [
        'screen-main', 'screen-sub', 'screen-game', 'screen-result',
        'screen-profile', 'screen-missions', 'screen-shop', 'screen-clase'
    ],
    currentOp: null,

    goTo(id) {
        this.screens.forEach(s => {
            const el = document.getElementById(s);
            if (el) el.classList.remove('active');
        });
        const target = document.getElementById(id);
        if (target) { target.classList.add('active'); target.scrollTop = 0; }

        const btnBack = document.getElementById('btn-back');
        if (btnBack) btnBack.style.display = (id === 'screen-main') ? 'none' : 'flex';

        if (window.AppUX?.setFocusMode) window.AppUX.setFocusMode(id === 'screen-game');

        document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === id);
        });

        if (id === 'screen-profile')  window.GM?.renderProfile?.();
        if (id === 'screen-missions') window.GM?.renderMissions?.();
        if (id === 'screen-shop')     window.GM?.renderShop?.();
    },

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
                this.goTo('screen-sub'); break;
            case 'screen-result': this.goTo('screen-sub'); break;
            case 'screen-sub':    this.goTo('screen-main'); break;
            default:              this.goTo('screen-main');
        }
    },

    showMenu(op, shouldNavigate = true) {
        const d = window.DB?.[op];
        if (!d) { console.error('[Nav] DB no listo para:', op); return; }
        this.currentOp = op;

        const subTitle = document.getElementById('sub-title');
        if (subTitle) { subTitle.innerText = d.title; subTitle.className = d.color; }

        const list = document.getElementById('sub-list');
        if (!list) return;
        list.innerHTML = '';
        
        d.games.forEach((game, idx) => {
            const gameId   = `${op}-${idx}`;
            const isDone   = typeof window.GS.isDone === 'function' ? window.GS.isDone(gameId) : (window.GS.completedGames || []).includes(gameId);
            const isLocked = (window.GS.lockedGames || []).includes(gameId) || (window.GS.globalLockedGames || []).includes(gameId);

            const btn = document.createElement('button');
            btn.dataset.gameId = gameId;

            if (isLocked) {
                btn.className = `btn-menu ${d.color} btn-done`;
                btn.disabled  = true;
                btn.innerHTML = `
                    <span class="btn-emoji" aria-hidden="true">🔒</span>
                    <span class="btn-label" style="text-decoration: line-through; opacity: 0.7;">${game.n}</span>
                    <span class="btn-done-badge" style="color:#EF4444; background: #FEE2E2; padding: 4px 8px; border-radius: 8px;">BLOQUEADO POR EL MOMENTO</span>`;
            } else {
                btn.className = `btn-menu ${d.color}`;
                const extraBadge = isDone ? `<span class="btn-done-badge" style="color:var(--success); background:#D1FAE5; padding: 4px 8px; border-radius: 8px;">✅ Completado</span>` : '';
                btn.innerHTML = `
                    <span class="btn-emoji" aria-hidden="true">${game.n.split(' ')[0]}</span>
                    <span class="btn-label">${game.n.split(' ').slice(1).join(' ')}</span>
                    ${extraBadge}`;
                btn.onclick = () => this._launchGame(gameId, game.f);
            }
            list.appendChild(btn);
        });
        if (shouldNavigate) this.goTo('screen-sub');
    },

    refreshUnlockedBlocks() {
        if (this.currentOp) {
            this.showMenu(this.currentOp, false);
        }
    },

    _launchGame(gameId, initFn) {
        window.GS.startBlock(gameId, initFn);
        if (window.AppUX?.startBlock) window.AppUX.startBlock();
        if (window.Effects?.clear) window.Effects.clear();
        initFn();
        this.goTo('screen-game');
    },

    nextQuestion() {
        if (!window.GS.currentInitFunc) { console.error('[Nav] Sin función de juego activa'); return; }
        if (window.Effects?.clear) window.Effects.clear();
        window.GS.currentInitFunc();
    },

    showResult() {
        window.GS.markCurrentDone();
        window.AuthManager?.saveProgress?.();

        const btn = document.querySelector(`[data-game-id="${window.GS.currentGameId}"]`);
        if (btn) {
            btn.classList.add('btn-done');
            btn.disabled = true;
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

window.addEventListener('studentBlocksUnlocked', () => {
    window.Navigation?.refreshUnlockedBlocks?.();
});

/* ── ÚNICO LISTENER DE CAMBIO DE BLOQUEOS OPTIMIZADO ── */
window.addEventListener('locksChanged', () => {
    const currentGame = window.GS?.currentGameId;
    if (currentGame) {
        const isLockedNow = (window.GS.lockedGames || []).includes(currentGame) || (window.GS.globalLockedGames || []).includes(currentGame);
        const gameScreen = document.getElementById('screen-game');
        if (isLockedNow && gameScreen && gameScreen.classList.contains('active')) {
            if (window.Effects?.clear) window.Effects.clear();
            window.Navigation?.goTo('screen-sub');
            window.GM?._showToast?.("Este ejercicio ha sido BLOQUEADO POR EL MOMENTO", "#EF4444");
        }
    }
    if (window.Navigation?.currentOp) {
        window.Navigation.showMenu(window.Navigation.currentOp, false);
    }
});