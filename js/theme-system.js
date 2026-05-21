

/* ══════════════════════════════════════════════════════════
   CATÁLOGO DE TEMÁTICAS
══════════════════════════════════════════════════════════ */
const THEMES = {

    /* ── 1. ESPACIAL 🚀 ─────────────────────────────── */
    space: {
        id       : 'space',
        name     : '🚀 Espacial',
        emoji    : '🚀',
        label    : 'Academia Espacial',

        /* Variables CSS que se inyectan en :root */
        vars: {
            '--bg-deep'       : '#07091c',
            '--bg-mid'        : '#0d1b4b',
            '--bg-surface'    : 'rgba(255,255,255,0.055)',
            '--primary'       : '#4f46e5',
            '--primary-dark'  : '#3730a3',
            '--primary-glow'  : 'rgba(79,70,229,0.35)',
            '--accent-1'      : '#7c3aed',
            '--accent-2'      : '#06b6d4',
            '--header-bg'     : 'rgba(79,70,229,0.8)',
            '--header-border' : 'rgba(167,139,250,0.25)',
            '--card-bg'       : 'rgba(13,27,75,0.9)',
            '--card-border'   : 'rgba(167,139,250,0.3)',
            '--text'          : '#e2e8f0',
            '--text-muted'    : '#94a3b8',
            '--text-highlight': '#a5b4fc',
            '--success'       : '#059669',
            '--success-dark'  : '#047857',
            '--success-light' : '#6ee7b7',
            '--danger'        : '#dc2626',
            '--danger-dark'   : '#b91c1c',
            '--warning'       : '#d97706',
            '--warning-dark'  : '#b45309',
            '--purple'        : '#7c3aed',
            '--purple-dark'   : '#6d28d9',
            '--splash-from'   : '#0d1b4b',
            '--splash-to'     : '#060918',
            '--font'          : "'Google Sans', system-ui, sans-serif",
        },

        /* Fondo del body (reemplaza el body background) */
        bodyBg: `
            radial-gradient(1px 1px at 7% 13%,#fff 0%,transparent 100%),
            radial-gradient(1px 1px at 23% 38%,#fff 0%,transparent 100%),
            radial-gradient(1.2px 1.2px at 41% 7%,#c7d2fe 0%,transparent 100%),
            radial-gradient(1px 1px at 56% 54%,#fff 0%,transparent 100%),
            radial-gradient(1px 1px at 69% 19%,#fff 0%,transparent 100%),
            radial-gradient(1.2px 1.2px at 80% 74%,#c7d2fe 0%,transparent 100%),
            radial-gradient(1px 1px at 91% 5%,#fff 0%,transparent 100%),
            radial-gradient(1px 1px at 13% 82%,#fff 0%,transparent 100%),
            radial-gradient(1px 1px at 46% 93%,#c7d2fe 0%,transparent 100%),
            radial-gradient(1.5px 1.5px at 62% 31%,#fff 0%,transparent 100%),
            radial-gradient(1px 1px at 33% 67%,#fff 0%,transparent 100%),
            radial-gradient(1.2px 1.2px at 77% 42%,#a5b4fc 0%,transparent 100%),
            linear-gradient(160deg,#07091c 0%,#0d1b4b 50%,#07091c 100%)`,

        /* Textos de la interfaz */
        ui: {
            appTitle       : '🚀 MathSpace',
            mainTitle      : 'Academia Espacial<br>Matemática',
            splashText     : 'Preparando misión matemática...',
            resultBadge    : '🚀',
            resultTitle    : '¡Misión completada!',
            resultMsg      : 'Completaste las 5 misiones del bloque.',
            scoreLabel     : '⭐',
            settingsTitle  : '⚙ Configuración',
        },

        /* Colores confetti temáticos */
        confettiColors: ['#4f46e5','#06b6d4','#7c3aed','#f59e0b','#10b981','#f472b6','#a5b4fc'],

        /* Base de datos de juegos con emojis temáticos */
        db: {
            add: {
                title : '🌟 Misiones de Suma',
                color : 'c-add',
                games : [
                    { n: '🛸 Nave Colectora',   f: () => window.initDrag('cristales','💎','t-caja',null) },
                    { n: '🌌 Nebulosa',          f: () => window.initDrag('estrellas','⭐','t-pecera',null) },
                    { n: '🧳 Mochila Espacial',  f: () => window.initDrag('módulos','🔩','t-mochila',null) },
                    { n: '🪐 Órbita',            f: () => window.initDrag('satélites','🛰️','t-bandeja','🪐') }
                ]
            },
            sub: {
                title : '☄️ Misiones de Resta',
                color : 'c-sub',
                games : [
                    { n: '👾 Invasor',       f: () => window.initDragSub('🌙','t-tazon','👾') },
                    { n: '🚀 Nave Espacial', f: () => window.initDragSub('👨‍🚀','t-bandeja','🚀') },
                    { n: '💥 Asteroides',    f: () => window.initDestroy('🪨') },
                    { n: '⚡ Rayos Láser',   f: () => window.initDestroy('🔵') }
                ]
            },
            mul: {
                title : '🌀 Misiones de Multiplicación',
                color : 'c-mul',
                games : [
                    { n: '⚡ Clonador Cuántico',  f: () => window.initCloner() },
                    { n: '🏭 Fábrica Galáctica',  f: () => window.initGrid() },
                    { n: '🎁 Cápsulas',            f: () => window.initDragMul('Antenas','📡','t-regalo',null) },
                    { n: '🥚 Huevos Alienígenas',  f: () => window.initDragMul('Huevos','🥚','t-nido',null) }
                ]
            },
            div: {
                title : '🔭 Misiones de División',
                color : 'c-div',
                games : [
                    { n: '🍽️ Raciones',         f: () => window.initDragDiv('Cristales','💎','t-plato',null) },
                    { n: '💰 Cofres Estelares',  f: () => window.initDragDiv('Monedas','🪙','t-cofre',null) },
                    { n: '🐾 Alienígenas',       f: () => window.initDragDiv('Huesos','🦴','t-tazon','👽') },
                    { n: '🏀 Portales',          f: () => window.initDragDiv('Balones','🔮','t-canasta',null) }
                ]
            }
        }
    },

    /* ── 2. EXPLORADORES 🧭 ──────────────────────────── */
    explorer: {
        id       : 'explorer',
        name     : '🧭 Exploradores',
        emoji    : '🧭',
        label    : 'Academia Exploradores',

        vars: {
            '--bg-deep'       : '#0d1a0a',
            '--bg-mid'        : '#1a3312',
            '--bg-surface'    : 'rgba(255,255,255,0.06)',
            '--primary'       : '#16a34a',
            '--primary-dark'  : '#166534',
            '--primary-glow'  : 'rgba(22,163,74,0.35)',
            '--accent-1'      : '#d97706',
            '--accent-2'      : '#84cc16',
            '--header-bg'     : 'rgba(22,101,52,0.88)',
            '--header-border' : 'rgba(134,239,172,0.25)',
            '--card-bg'       : 'rgba(10,26,7,0.92)',
            '--card-border'   : 'rgba(134,239,172,0.3)',
            '--text'          : '#ecfdf5',
            '--text-muted'    : '#86efac',
            '--text-highlight': '#bbf7d0',
            '--success'       : '#16a34a',
            '--success-dark'  : '#166534',
            '--success-light' : '#86efac',
            '--danger'        : '#dc2626',
            '--danger-dark'   : '#b91c1c',
            '--warning'       : '#d97706',
            '--warning-dark'  : '#b45309',
            '--purple'        : '#a16207',
            '--purple-dark'   : '#854d0e',
            '--splash-from'   : '#1a3312',
            '--splash-to'     : '#0d1a0a',
            '--font'          : "'Georgia', 'Times New Roman', serif",
        },

        bodyBg: `
            radial-gradient(2px 2px at 12% 8%, #4ade80 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 28% 32%, #86efac 0%, transparent 100%),
            radial-gradient(2px 2px at 45% 65%, #4ade80 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 15%, #d9f99d 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 78% 48%, #86efac 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 80%, #4ade80 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 6% 72%, #d9f99d 0%, transparent 100%),
            radial-gradient(1px 1px at 52% 90%, #86efac 0%, transparent 100%),
            linear-gradient(160deg,#0d1a0a 0%,#1a3312 45%,#0d1a0a 100%)`,

        ui: {
            appTitle       : '🧭 MathQuest',
            mainTitle      : 'Academia de<br>Exploradores',
            splashText     : 'Preparando la expedición...',
            resultBadge    : '🏆',
            resultTitle    : '¡Tesoro encontrado!',
            resultMsg      : 'Completaste los 5 desafíos de exploración.',
            scoreLabel     : '💎',
            settingsTitle  : '🗺️ Opciones',
        },

        confettiColors: ['#16a34a','#d97706','#84cc16','#fbbf24','#86efac','#fb923c','#4ade80'],

        db: {
            add: {
                title : '🗺️ Rutas de Suma',
                color : 'c-add',
                games : [
                    { n: '🌿 Selva Colectora',   f: () => window.initDrag('gemas','💎','t-caja',null) },
                    { n: '🦜 Tesoro Aviario',    f: () => window.initDrag('plumas','🪶','t-pecera',null) },
                    { n: '🎒 Mochila del Explorador', f: () => window.initDrag('mapas','🗺️','t-mochila',null) },
                    { n: '🌺 Sendero Floral',    f: () => window.initDrag('flores','🌸','t-bandeja','🌺') }
                ]
            },
            sub: {
                title : '🌊 Rutas de Resta',
                color : 'c-sub',
                games : [
                    { n: '🐊 Río Peligroso',  f: () => window.initDragSub('🪸','t-tazon','🐊') },
                    { n: '🦁 Sabana',          f: () => window.initDragSub('🌿','t-bandeja','🦁') },
                    { n: '🍄 Hongos Tóxicos',  f: () => window.initDestroy('🍄') },
                    { n: '🕷️ Arañas',          f: () => window.initDestroy('🕷️') }
                ]
            },
            mul: {
                title : '🏕️ Campamento Multiplicación',
                color : 'c-mul',
                games : [
                    { n: '📦 Suministros',        f: () => window.initCloner() },
                    { n: '🏕️ Red de Campamentos', f: () => window.initGrid() },
                    { n: '🎁 Paquetes',            f: () => window.initDragMul('Brújulas','🧭','t-regalo',null) },
                    { n: '🥚 Nidos de Aves',       f: () => window.initDragMul('Huevos','🥚','t-nido',null) }
                ]
            },
            div: {
                title : '🔍 Expedición División',
                color : 'c-div',
                games : [
                    { n: '🍽️ Raciones',         f: () => window.initDragDiv('Frutas','🍎','t-plato',null) },
                    { n: '💰 Cofre del Tesoro',  f: () => window.initDragDiv('Monedas','🪙','t-cofre',null) },
                    { n: '🐾 Huellas',           f: () => window.initDragDiv('Huellas','🐾','t-tazon','🦊') },
                    { n: '🏹 Aldeas',            f: () => window.initDragDiv('Flechas','🏹','t-canasta',null) }
                ]
            }
        }
    },

    /* ── 3. SUPERHÉROES 🦸 ───────────────────────────── */
    hero: {
        id       : 'hero',
        name     : '🦸 Superhéroes',
        emoji    : '🦸',
        label    : 'Academia de Héroes',

        vars: {
            '--bg-deep'       : '#0a0014',
            '--bg-mid'        : '#1a0033',
            '--bg-surface'    : 'rgba(255,255,255,0.06)',
            '--primary'       : '#9333ea',
            '--primary-dark'  : '#6b21a8',
            '--primary-glow'  : 'rgba(147,51,234,0.45)',
            '--accent-1'      : '#f59e0b',
            '--accent-2'      : '#ec4899',
            '--header-bg'     : 'rgba(88,28,135,0.9)',
            '--header-border' : 'rgba(216,180,254,0.3)',
            '--card-bg'       : 'rgba(10,0,20,0.92)',
            '--card-border'   : 'rgba(216,180,254,0.35)',
            '--text'          : '#faf5ff',
            '--text-muted'    : '#c4b5fd',
            '--text-highlight': '#e9d5ff',
            '--success'       : '#059669',
            '--success-dark'  : '#047857',
            '--success-light' : '#6ee7b7',
            '--danger'        : '#dc2626',
            '--danger-dark'   : '#b91c1c',
            '--warning'       : '#f59e0b',
            '--warning-dark'  : '#d97706',
            '--purple'        : '#9333ea',
            '--purple-dark'   : '#6b21a8',
            '--splash-from'   : '#1a0033',
            '--splash-to'     : '#0a0014',
            '--font'          : "'Impact', 'Arial Black', system-ui, sans-serif",
        },

        bodyBg: `
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(147,51,234,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 90%, rgba(236,72,153,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 50%),
            radial-gradient(1.5px 1.5px at 15% 20%, #c4b5fd 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 55%, #f0abfc 0%, transparent 100%),
            radial-gradient(2px 2px at 70% 30%, #fbbf24 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 85% 65%, #c4b5fd 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 85%, #f0abfc 0%, transparent 100%),
            linear-gradient(135deg,#0a0014 0%,#1a0033 40%,#0a0014 100%)`,

        ui: {
            appTitle       : '🦸 MathHero',
            mainTitle      : 'Academia de<br>Superhéroes',
            splashText     : 'Activando poderes matemáticos...',
            resultBadge    : '🏅',
            resultTitle    : '¡Misión heroica!',
            resultMsg      : 'Completaste los 5 retos heroicos.',
            scoreLabel     : '⚡',
            settingsTitle  : '🛡️ Configuración',
        },

        confettiColors: ['#9333ea','#f59e0b','#ec4899','#a855f7','#fbbf24','#f472b6','#c4b5fd'],

        db: {
            add: {
                title : '⚡ Poderes de Suma',
                color : 'c-add',
                games : [
                    { n: '🛡️ Escudo de Poder',  f: () => window.initDrag('cristales','💎','t-caja',null) },
                    { n: '⚡ Banco de Energía',  f: () => window.initDrag('rayos','⚡','t-pecera',null) },
                    { n: '🎒 Mochila Heroica',   f: () => window.initDrag('escudos','🛡️','t-mochila',null) },
                    { n: '🏙️ Ciudad Segura',     f: () => window.initDrag('casas','🏠','t-bandeja','🏙️') }
                ]
            },
            sub: {
                title : '💥 Misiones de Resta',
                color : 'c-sub',
                games : [
                    { n: '👹 Villanos',           f: () => window.initDragSub('💥','t-tazon','👹') },
                    { n: '🚁 Rescate Aéreo',      f: () => window.initDragSub('🦸','t-bandeja','🚁') },
                    { n: '💣 Bombas',             f: () => window.initDestroy('💣') },
                    { n: '🌩️ Tormentas',         f: () => window.initDestroy('🌩️') }
                ]
            },
            mul: {
                title : '🌟 Equipo Multiplicación',
                color : 'c-mul',
                games : [
                    { n: '⚡ Clonación Heroica',   f: () => window.initCloner() },
                    { n: '🏢 Base de Héroes',      f: () => window.initGrid() },
                    { n: '🎁 Kits de Héroe',       f: () => window.initDragMul('Capas','🦸','t-regalo',null) },
                    { n: '🥚 Huevos de Poder',     f: () => window.initDragMul('Orbes','🔮','t-nido',null) }
                ]
            },
            div: {
                title : '🔮 División Heroica',
                color : 'c-div',
                games : [
                    { n: '🍽️ Raciones Heroicas',  f: () => window.initDragDiv('Poderes','⚡','t-plato',null) },
                    { n: '💰 Cofre Héroe',         f: () => window.initDragDiv('Medallas','🏅','t-cofre',null) },
                    { n: '🐾 Mascotas',            f: () => window.initDragDiv('Patitas','🐾','t-tazon','🦸') },
                    { n: '🏹 Flechas',             f: () => window.initDragDiv('Flechas','🏹','t-canasta',null) }
                ]
            }
        }
    }
};


/* ══════════════════════════════════════════════════════════
   THEME MANAGER
══════════════════════════════════════════════════════════ */
const ThemeManager = {
    STORAGE_KEY : 'mathapp_theme',
    current     : null,

    /* ── Inicializar: cargar tema guardado o usar default ── */
    init() {
        const saved = this._load();
        this.apply(saved || 'space');
    },

    /* ── Aplicar tema por ID ──────────────────────────── */
    apply(themeId) {
        const theme = THEMES[themeId];
        if (!theme) {
            console.warn('[ThemeManager] Tema desconocido:', themeId);
            return;
        }

        this.current = theme;
        this._save(themeId);

        /* 1. Variables CSS en :root */
        this._applyVars(theme.vars);

        /* 2. Fondo del body */
        document.body.style.backgroundImage = theme.bodyBg;
        document.body.style.backgroundColor = theme.vars['--bg-deep'];

        /* 3. Textos de la interfaz */
        this._applyUI(theme.ui);

        /* 4. Fuente principal */
        document.body.style.fontFamily = theme.vars['--font'];

        /* 5. Marca el tema activo en el body (para CSS overrides) */
        document.body.setAttribute('data-theme', themeId);

        /* 6. Actualizar la BD de juegos */
        window.DB = theme.db;

        /* 7. Actualizar colores de confetti */
        if (window.Effects) {
            window.Effects._themeColors = theme.confettiColors;
        }

        /* 8. Disparar evento para que otros módulos reaccionen */
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));

        console.info(`[ThemeManager] Tema aplicado: ${theme.name}`);
    },

    /* ── Abrir selector de tema ───────────────────────── */
    openSelector() {
        const modal = document.getElementById('theme-modal');
        if (modal) {
            modal.classList.add('open');
            // Marcar el tema activo en el selector
            document.querySelectorAll('.theme-card').forEach(card => {
                card.classList.toggle('active', card.dataset.theme === this.current?.id);
            });
        }
    },

    closeSelector() {
        const modal = document.getElementById('theme-modal');
        if (modal) modal.classList.remove('open');
    },

    /* ── Helpers privados ──────────────────────────────── */
    _applyVars(vars) {
        const root = document.documentElement;
        Object.entries(vars).forEach(([key, val]) => {
            root.style.setProperty(key, val);
        });
    },

    _applyUI(ui) {
        const set = (id, html, attr = 'innerHTML') => {
            const el = document.getElementById(id);
            if (el) el[attr] = html;
        };

        // Top bar
        const titleEl = document.querySelector('.top-title');
        if (titleEl) titleEl.innerHTML = ui.appTitle;

        // Título principal
        const mainTitle = document.querySelector('#screen-main h1');
        if (mainTitle) mainTitle.innerHTML = ui.mainTitle;

        // Pantalla resultado
        const resultBadge = document.querySelector('.result-badge');
        if (resultBadge) resultBadge.textContent = ui.resultBadge;
        set('result-title',   ui.resultTitle,   'textContent');

        // Score label
        const scoreEl = document.querySelector('.top-score');
        if (scoreEl) {
            const scoreNum = document.getElementById('score');
            if (scoreNum) {
                const num = scoreNum.textContent;
                scoreEl.innerHTML = `${ui.scoreLabel} <span id="score">${num}</span>`;
            }
        }

        // Splash text
        const splashText = document.querySelector('.loading-text');
        if (splashText) splashText.textContent = ui.splashText;

        // Settings title
        const settingsTitle = document.getElementById('settings-title');
        if (settingsTitle) settingsTitle.textContent = ui.settingsTitle;
    },

    _save(themeId) {
        try { localStorage.setItem(this.STORAGE_KEY, themeId); } catch(e) {}
    },

    _load() {
        try { return localStorage.getItem(this.STORAGE_KEY); } catch(e) { return null; }
    }
};

/* ── Exportar al scope global ── */
window.THEMES       = THEMES;
window.ThemeManager = ThemeManager;
