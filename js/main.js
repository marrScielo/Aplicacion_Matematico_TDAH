/**
 * main.js  (ES module) — v2: eventos de gamificación integrados
 */

import { loginAutomatico } from './auth-manager.js';

/* ── Inicializar tema ── */
document.addEventListener('DOMContentLoaded', () => {
    window.ThemeManager?.init();
});

/* ── Eventos al cargar el DOM ── */
document.addEventListener('DOMContentLoaded', () => {

    /* ── Volver ── */
    document.getElementById('btn-back')
        ?.addEventListener('click', () => window.Navigation?.back());

    /* ── Devolver piezas ── */
    document.getElementById('btn-reset')
        ?.addEventListener('click', () => window.Effects?.resetLevel());

    /* ── Comprobar respuesta ── */
    document.getElementById('btn-check')
        ?.addEventListener('click', () => {
            if (typeof window.checkLogic === 'function') {
                window.checkLogic();
            } else {
                console.warn('[main] checkLogic no está lista aún.');
            }
        });

    /* ── Siguiente pregunta ── */
    document.getElementById('btn-next')
        ?.addEventListener('click', () => {
            window.Effects?.clear();
            window.Navigation?.nextQuestion();
        });

    /* ── Desde resultado: volver al submenú ── */
    document.getElementById('btn-result-next')
        ?.addEventListener('click', () => window.Navigation?.goTo('screen-sub'));

    /* ── Desde resultado: ir al menú principal ── */
    document.getElementById('btn-result-menu')
        ?.addEventListener('click', () => window.Navigation?.goTo('screen-main'));

    /* ── Menú principal: botones de operación ── */
    document.querySelectorAll('.btn-menu[data-op]').forEach(btn => {
        btn.addEventListener('click', () => window.Navigation?.showMenu(btn.dataset.op));
    });

    /* ── Navegación inferior ── */
    document.querySelectorAll('.bottom-nav-btn[data-screen]').forEach(btn => {
        btn.addEventListener('click', () => {
            window.Navigation?.goTo(btn.dataset.screen);
        });
    });

    /* ── Avatar en HUD ── */
    document.getElementById('hud-avatar-btn')
        ?.addEventListener('click', () => window.Navigation?.goTo('screen-profile'));

    /* ── Botón misiones en HUD ── */
    document.getElementById('hud-missions-btn')
        ?.addEventListener('click', () => window.Navigation?.goTo('screen-missions'));

    /* ── Selector de avatar ── */
    document.querySelectorAll('.avatar-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.avatar;
            if (id) window.GM?.selectAvatar(id);
        });
    });

    /* ── Filtros de tienda ── */
    document.querySelectorAll('.shop-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.shop-filter-btn')
                .forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            window.GM?.renderShop(btn.dataset.filter || null);
        });
    });

    /* ════════════════════════════════════════════════
       MODALES
    ════════════════════════════════════════════════ */

    /* Tema */
    document.getElementById('btn-theme')?.addEventListener('click', () => {
        const modal = document.getElementById('theme-modal');
        if (modal) {
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            const currentId = window.ThemeManager?.current?.id;
            document.querySelectorAll('.theme-card').forEach(card => {
                card.classList.toggle('active', card.dataset.theme === currentId);
            });
        }
    });

    document.getElementById('theme-modal-close')?.addEventListener('click', () => {
        const modal = document.getElementById('theme-modal');
        if (modal) {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
        }
    });

    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const themeId = card.dataset.theme;
            if (!themeId) return;
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            window.ThemeManager?.apply(themeId);
            document.querySelector('.app')?.classList.remove('theme-flash');
            void document.querySelector('.app')?.offsetWidth;
            document.querySelector('.app')?.classList.add('theme-flash');
            setTimeout(() => document.querySelector('.app')?.classList.remove('theme-flash'), 400);
            setTimeout(() => {
                const modal = document.getElementById('theme-modal');
                if (modal) {
                    modal.classList.remove('open');
                    modal.setAttribute('aria-hidden', 'true');
                }
            }, 600);
        });
    });

    /* Escape / click en fondo */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.getElementById('theme-modal')?.classList.remove('open');
            const sm = document.getElementById('settings-modal');
            if (sm) { sm.style.display = 'none'; sm.setAttribute('aria-hidden', 'true'); }
        }
    });

    document.getElementById('theme-modal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('open');
            this.setAttribute('aria-hidden', 'true');
        }
    });

    /* Sonido global */
    window.Effects?.attachGlobalClickSound?.();

    /* ── Actualizar emojis del menú al cambiar tema ── */
    document.addEventListener('themeChanged', (e) => {
        const theme = e.detail;
        if (!theme) return;
        const themeEmojis = {
            space   : { add:'🌟', sub:'☄️',  mul:'🌀', div:'🔭' },
            explorer: { add:'🗺️', sub:'🌊', mul:'🏕️', div:'🔍' },
            hero    : { add:'⚡', sub:'💥',  mul:'🌟', div:'🔮' },
        };
        const emojis = themeEmojis[theme.id] || themeEmojis.space;

        document.querySelectorAll('.btn-menu[data-op]').forEach(btn => {
            const op     = btn.dataset.op;
            const emojiEl = btn.querySelector('.btn-emoji');
            if (emojiEl && emojis[op]) emojiEl.textContent = emojis[op];
        });

        const scoreEl = document.querySelector('.top-score');
        if (scoreEl && theme.ui?.scoreLabel) {
            const num = document.getElementById('score')?.textContent || '0';
            scoreEl.innerHTML = `${theme.ui.scoreLabel} <span id="score">${num}</span>`;
        }

        /* Actualizar título de la app */
        const titleEl = document.querySelector('.top-title');
        if (titleEl && theme.ui?.appTitle) titleEl.textContent = theme.ui.appTitle;
    });
});

/* ── Splash screen ── */
window.addEventListener('load', async () => {
    const splash = document.getElementById('splash-screen');
    const bar    = document.querySelector('.loading-bar');
    if (!splash || !bar) return;

    let width = 0;
    const registroPromesa = loginAutomatico();

    const interval = setInterval(async () => {
        width += Math.random() * 10;

        if (width >= 90) {
            width = 90;
            bar.style.width = '90%';

            const ok = await registroPromesa;
            if (ok) {
                /* Inicializar gamificación una vez cargado Firebase */
                window.GM?.init();

                bar.style.width = '100%';
                clearInterval(interval);
                setTimeout(() => {
                    splash.style.transition = 'opacity 0.6s ease';
                    splash.style.opacity    = '0';
                    setTimeout(() => { splash.style.display = 'none'; }, 620);
                }, 700);
            }
        } else {
            bar.style.width = width + '%';
        }
    }, 120);
});
