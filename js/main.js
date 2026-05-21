
import { loginAutomatico } from './auth-manager.js';


document.addEventListener('DOMContentLoaded', () => {
    window.ThemeManager?.init();
});

/* ── Eventos al cargar el DOM ───────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

    /* Volver */
    document.getElementById('btn-back')
        ?.addEventListener('click', () => window.Navigation?.back());

    /* Devolver piezas */
    document.getElementById('btn-reset')
        ?.addEventListener('click', () => window.Effects?.resetLevel());

    /* Comprobar respuesta */
    document.getElementById('btn-check')
        ?.addEventListener('click', () => {
            if (typeof window.checkLogic === 'function') {
                window.checkLogic();
            } else {
                console.warn('[main] checkLogic no está lista aún.');
            }
        });

    /* Siguiente pregunta dentro del mismo bloque */
    document.getElementById('btn-next')
        ?.addEventListener('click', () => {
            window.Effects?.clear();
            window.Navigation?.nextQuestion();
        });

    /* Desde resultado: jugar otro bloque del mismo submenú */
    document.getElementById('btn-result-next')
        ?.addEventListener('click', () => {
            window.Navigation?.goTo('screen-sub');
        });

    /* Desde resultado: volver al menú principal */
    document.getElementById('btn-result-menu')
        ?.addEventListener('click', () => {
            window.Navigation?.goTo('screen-main');
        });

    /* ── MODAL DE TEMA ── */
    document.getElementById('btn-theme')?.addEventListener('click', () => {
        const modal = document.getElementById('theme-modal');
        if (modal) {
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            // Marcar el tema activo
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

    /* Click en cards de tema */
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const themeId = card.dataset.theme;
            if (!themeId) return;

            // Feedback visual inmediato: marcar activo
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            // Aplicar el tema
            window.ThemeManager?.apply(themeId);

            // Flash de transición
            document.querySelector('.app')?.classList.remove('theme-flash');
            void document.querySelector('.app')?.offsetWidth;
            document.querySelector('.app')?.classList.add('theme-flash');
            setTimeout(() => document.querySelector('.app')?.classList.remove('theme-flash'), 400);

            // Cerrar modal tras breve pausa (para que el niño vea el cambio)
            setTimeout(() => {
                const modal = document.getElementById('theme-modal');
                if (modal) {
                    modal.classList.remove('open');
                    modal.setAttribute('aria-hidden', 'true');
                }
            }, 600);
        });
    });

    /* Cerrar modales con Escape */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.getElementById('theme-modal')?.classList.remove('open');
            const sm = document.getElementById('settings-modal');
            if (sm) { sm.style.display = 'none'; sm.setAttribute('aria-hidden', 'true'); }
        }
    });

    /* Cerrar modales al hacer click en el fondo */
    document.getElementById('theme-modal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('open');
            this.setAttribute('aria-hidden', 'true');
        }
    });

    /* Sonido global */
    window.Effects?.attachGlobalClickSound?.();

    /* Menú principal — botones de operación */
    document.querySelectorAll('.btn-menu[data-op]').forEach(btn => {
        btn.addEventListener('click', () => {
            window.Navigation?.showMenu(btn.dataset.op);
        });
    });

    /* ── Actualizar emojis del menú principal al cambiar tema ── */
    document.addEventListener('themeChanged', (e) => {
        const theme = e.detail;
        if (!theme?.db) return;

        // Actualizar los 4 botones del menú principal
        const opMap = {
            add: { emoji: theme.db.add.games[0]?.n?.split(' ')[0] || '🌟' },
            sub: { emoji: theme.db.sub.games[0]?.n?.split(' ')[0] || '☄️' },
            mul: { emoji: theme.db.mul.games[0]?.n?.split(' ')[0] || '🌀' },
            div: { emoji: theme.db.div.games[0]?.n?.split(' ')[0] || '🔭' },
        };

        // Emoji principal por tema para los botones de op
        const themeEmojis = {
            space   : { add:'🌟', sub:'☄️',  mul:'🌀', div:'🔭' },
            explorer: { add:'🗺️', sub:'🌊', mul:'🏕️', div:'🔍' },
            hero    : { add:'⚡', sub:'💥',  mul:'🌟', div:'🔮' },
        };
        const emojis = themeEmojis[theme.id] || themeEmojis.space;

        document.querySelectorAll('.btn-menu[data-op]').forEach(btn => {
            const op = btn.dataset.op;
            const emojiEl = btn.querySelector('.btn-emoji');
            if (emojiEl && emojis[op]) emojiEl.textContent = emojis[op];
        });

        // Actualizar icono score
        const scoreEl = document.querySelector('.top-score');
        if (scoreEl && theme.ui?.scoreLabel) {
            const num = document.getElementById('score')?.textContent || '0';
            scoreEl.innerHTML = `${theme.ui.scoreLabel} <span id="score">${num}</span>`;
        }
    });
});

/* ── Splash screen ──────────────────────────────────── */
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
