/**
 * gamification.js
 * ─────────────────────────────────────────────────────────
 * Motor completo de gamificación para niños de primaria con TDAH.
 * Gestiona: avatar, tienda, misiones, recompensas, progreso visual.
 *
 * Expone: window.GM  (GamificationManager)
 *
 * Dependencias (deben cargarse antes):
 *   - game-state.js  → window.GS
 *   - effects-qa.js  → window.Effects
 */

/* ══════════════════════════════════════════════════════════
   CATÁLOG══════════════════════════════════════════════════════════O DE AVATARES
 */
const AVATARS = {
    space: {
        id    : 'space',
        name  : '¡Astronauta!',
        emoji : '👨‍🚀',
        bg    : 'linear-gradient(135deg,#0d1b4b,#4f46e5)',
        theme : 'space',
        desc  : 'Explora el universo matemático',
    },
    explorer: {
        id    : 'explorer',
        name  : '¡Explorador!',
        emoji : '🧭',
        bg    : 'linear-gradient(135deg,#1a3312,#16a34a)',
        theme : 'explorer',
        desc  : 'Descubre mundos de números',
    },
    hero: {
        id    : 'hero',
        name  : '¡Superhéroe!',
        emoji : '🦸',
        bg    : 'linear-gradient(135deg,#1e0a3c,#7c3aed)',
        theme : 'hero',
        desc  : 'Salva el día con matemáticas',
    },
};

/* ══════════════════════════════════════════════════════════
   CATÁLOGO DE ACCESORIOS POR TEMÁTICA
══════════════════════════════════════════════════════════ */
const ACCESSORIES = [
    /* ── ESPACIAL ── */
    { id:'space-helmet',   theme:'space',    name:'Casco Astronauta', emoji:'🪖',  price:5,  slot:'head',  desc:'Perfecto para explorar galaxias' },
    { id:'space-robot',    theme:'space',    name:'Robot Mini',       emoji:'🤖',  price:8,  slot:'pet',   desc:'Tu compañero robótico' },
    { id:'space-jetpack',  theme:'space',    name:'Mochila Jetpack',  emoji:'🎒',  price:10, slot:'back',  desc:'Vuela entre las estrellas' },
    { id:'space-suit',     theme:'space',    name:'Traje Galáctico',  emoji:'🥼',  price:15, slot:'body',  desc:'Traje espacial de élite' },
    { id:'space-stars',    theme:'space',    name:'Estrellas Brillantes', emoji:'✨', price:3, slot:'effect', desc:'Brilla como una estrella' },

    /* ── EXPLORADOR ── */
    { id:'exp-hat',        theme:'explorer', name:'Sombrero Aventurero', emoji:'🎩', price:5, slot:'head', desc:'El sombrero del gran explorador' },
    { id:'exp-compass',    theme:'explorer', name:'Brújula Mágica',   emoji:'🧭',  price:6,  slot:'tool',  desc:'Nunca te pierdas' },
    { id:'exp-backpack',   theme:'explorer', name:'Mochila Aventura', emoji:'🎒',  price:10, slot:'back',  desc:'Lleva todo lo que necesitas' },
    { id:'exp-map',        theme:'explorer', name:'Mapa Mágico',      emoji:'🗺️',  price:8,  slot:'tool',  desc:'Un mapa de mundos secretos' },
    { id:'exp-pet',        theme:'explorer', name:'Mascota Selvática', emoji:'🦜', price:12, slot:'pet',   desc:'Tu loro aventurero' },

    /* ── SUPERHÉROE ── */
    { id:'hero-cape',      theme:'hero',     name:'Capa Heroica',     emoji:'🦸',  price:8,  slot:'back',  desc:'La capa de un verdadero héroe' },
    { id:'hero-mask',      theme:'hero',     name:'Máscara de Héroe', emoji:'🥽',  price:5,  slot:'head',  desc:'Protege tu identidad secreta' },
    { id:'hero-boots',     theme:'hero',     name:'Botas de Poder',   emoji:'👟',  price:7,  slot:'feet',  desc:'Corre más rápido que la luz' },
    { id:'hero-shield',    theme:'hero',     name:'Escudo Legendario',emoji:'🛡️',  price:12, slot:'tool',  desc:'Protégete de cualquier error' },
    { id:'hero-energy',    theme:'hero',     name:'Energía de Héroe', emoji:'⚡',  price:4,  slot:'effect', desc:'¡Irradia poder matemático!' },
];

/* ══════════════════════════════════════════════════════════
   CATÁLOGO DE MISIONES
══════════════════════════════════════════════════════════ */
const MISSIONS_CATALOG = [
    {
        id      : 'first_block',
        title   : '¡Primera Misión!',
        emoji   : '🚀',
        desc    : 'Completa tu primer bloque',
        type    : 'blocks',
        goal    : 1,
        reward  : 5,
        color   : '#4f46e5',
    },
    {
        id      : 'three_correct',
        title   : 'Trío Perfecto',
        emoji   : '🌟',
        desc    : 'Responde 3 preguntas correctas seguidas',
        type    : 'streak',
        goal    : 3,
        reward  : 3,
        color   : '#f59e0b',
    },
    {
        id      : 'five_blocks',
        title   : '¡Superblocks!',
        emoji   : '🏆',
        desc    : 'Completa 5 bloques en total',
        type    : 'blocks',
        goal    : 5,
        reward  : 15,
        color   : '#ef4444',
    },
    {
        id      : 'ten_correct',
        title   : 'Genio Matemático',
        emoji   : '🧠',
        desc    : 'Responde 10 preguntas correctas',
        type    : 'correct',
        goal    : 10,
        reward  : 8,
        color   : '#10b981',
    },
    {
        id      : 'buy_accessory',
        title   : '¡De Compras!',
        emoji   : '🛍️',
        desc    : 'Compra tu primer accesorio',
        type    : 'inventory',
        goal    : 1,
        reward  : 5,
        color   : '#ec4899',
    },
    {
        id      : 'streak_5',
        title   : 'Racha Épica',
        emoji   : '🔥',
        desc    : '¡5 respuestas correctas seguidas!',
        type    : 'streak',
        goal    : 5,
        reward  : 10,
        color   : '#f97316',
    },
    {
        id      : 'twenty_correct',
        title   : 'Campeón Galáctico',
        emoji   : '👑',
        desc    : 'Responde 20 preguntas correctas',
        type    : 'correct',
        goal    : 20,
        reward  : 20,
        color   : '#8b5cf6',
    },
    {
        id      : 'play_time',
        title   : 'Explorador Dedicado',
        emoji   : '⏱️',
        desc    : 'Juega durante 5 minutos',
        type    : 'time',
        goal    : 5,
        reward  : 5,
        color   : '#06b6d4',
    },
];

/* ══════════════════════════════════════════════════════════
   GAMIFICATION MANAGER
══════════════════════════════════════════════════════════ */
const GM = {

    /* ── Init ─────────────────────────────────────── */
    init() {
        this._initMissions();
        this._startTimer();
        this._renderHUD();
        this._checkAvatarFirstTime();
    },

    /* ── Inicializar misiones en GS si no existen ── */
    _initMissions() {
        MISSIONS_CATALOG.forEach(m => {
            if (!window.GS.missions[m.id]) {
                window.GS.missions[m.id] = {
                    completed   : false,
                    progress    : 0,
                    rewardGiven : false,
                };
            }
        });
    },

    /* ── Timer de juego ──────────────────────────── */
    _startTimer() {
        setInterval(() => {
            window.GS.playMinutes += (1/60);
            this.checkMissions();
        }, 1000);
    },

    /* ── Verificar si debemos mostrar selector de avatar ── */
    _checkAvatarFirstTime() {
        if (!window.GS.avatarId) {
            // Primera vez: forzar selección de avatar
            setTimeout(() => this.showAvatarSelector(), 800);
        } else {
            this._updateAllAvatarDisplays();
        }
    },

    /* ════════════════════════════════════════════════
       AVATAR
    ════════════════════════════════════════════════ */

    showAvatarSelector() {
        const modal = document.getElementById('avatar-selector-modal');
        if (!modal) return;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    },

    hideAvatarSelector() {
        const modal = document.getElementById('avatar-selector-modal');
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    },

    selectAvatar(id) {
        if (!AVATARS[id]) return;
        window.GS.avatarId = id;
        this.hideAvatarSelector();
        this._updateAllAvatarDisplays();
        this._showToast(`¡Bienvenido, ${AVATARS[id].name} 🎉`, '#4f46e5');
        window.AuthManager?.saveProgress?.();

        /* Alinear tema con avatar si el usuario no ha cambiado tema manualmente */
        const savedTheme = localStorage.getItem('selectedTheme');
        if (!savedTheme || savedTheme === 'space') {
            window.ThemeManager?.apply?.(AVATARS[id].theme);
        }
    },

    _getAvatarEmoji() {
        const base = AVATARS[window.GS.avatarId]?.emoji || '⭐';
        /* Añadir primer accesorio equipado visualmente */
        const firstEquipped = [...window.GS.equipped][0];
        if (firstEquipped) {
            const acc = ACCESSORIES.find(a => a.id === firstEquipped);
            if (acc) return acc.emoji + base;
        }
        return base;
    },

    _updateAllAvatarDisplays() {
        const av   = AVATARS[window.GS.avatarId];
        const emoji = this._getAvatarEmoji();
        document.querySelectorAll('.avatar-display').forEach(el => {
            el.textContent = emoji;
            if (av) el.title = av.name;
        });
        document.querySelectorAll('.avatar-name').forEach(el => {
            el.textContent = av ? av.name : '¡Elige tu héroe!';
        });
    },

    /* ════════════════════════════════════════════════
       MISIONES
    ════════════════════════════════════════════════ */

    checkMissions() {
        let anyNew = false;
        MISSIONS_CATALOG.forEach(m => {
            const state = window.GS.missions[m.id];
            if (!state || state.completed) return;

            let current = 0;
            switch (m.type) {
                case 'blocks'    : current = window.GS.totalBlocks;   break;
                case 'streak'    : current = window.GS.streak;        break;
                case 'correct'   : current = window.GS.totalCorrect;  break;
                case 'inventory' : current = window.GS.inventory.size; break;
                case 'time'      : current = Math.floor(window.GS.playMinutes); break;
            }

            state.progress = Math.min(current, m.goal);

            if (current >= m.goal && !state.rewardGiven) {
                state.completed   = true;
                state.rewardGiven = true;
                anyNew = true;
                this._completeMission(m);
            }
        });

        if (anyNew) {
            this.renderMissions();
            window.AuthManager?.saveProgress?.();
        }

        this._renderHUD();
    },

    _completeMission(m) {
        window.GS.coins += m.reward;

        /* Actualizar score visual */
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.innerText = window.GS.completedBlockCount?.() ?? window.GS.totalBlocks;

        this._showMissionComplete(m);
        this._showToast(`¡Misión completada! +${m.reward} monedas`, m.color);
        window.Effects?.animateScore?.();
    },

    _showMissionComplete(m) {
        const overlay = document.createElement('div');
        overlay.className = 'mission-complete-overlay';
        overlay.innerHTML = `
            <div class="mission-complete-card">
                <div class="mc-emoji">${m.emoji}</div>
                <div class="mc-title">¡Misión completada!</div>
                <div class="mc-name">${m.title}</div>
                <div class="mc-reward">+${m.reward} monedas</div>
                <button class="mc-btn" onclick="this.closest('.mission-complete-overlay').remove()">
                    ¡Genial! 🎉
                </button>
            </div>`;
        document.body.appendChild(overlay);
        window.Effects?.celebrateConfetti?.(false);
        setTimeout(() => overlay.remove(), 4000);
    },

    renderMissions() {
        const container = document.getElementById('missions-list');
        if (!container) return;
        container.innerHTML = '';

        MISSIONS_CATALOG.forEach(m => {
            const state   = window.GS.missions[m.id] || {};
            const pct     = Math.round((state.progress || 0) / m.goal * 100);
            const done    = state.completed;

            const card = document.createElement('div');
            card.className = `mission-card ${done ? 'mission-done' : ''}`;
            card.innerHTML = `
                <div class="mission-emoji">${m.emoji}</div>
                <div class="mission-info">
                    <div class="mission-title">${m.title}</div>
                    <div class="mission-desc">${m.desc}</div>
                    <div class="mission-bar-wrap">
                        <div class="mission-bar" style="width:${pct}%;background:${m.color}"></div>
                    </div>
                    <div class="mission-progress-text">${state.progress||0} / ${m.goal}</div>
                </div>
                <div class="mission-reward">
                    ${done ? '✅' : `+${m.reward} monedas`}
                </div>`;
            container.appendChild(card);
        });
    },

    /* ════════════════════════════════════════════════
       TIENDA
    ════════════════════════════════════════════════ */

    renderShop(filterTheme) {
        const container = document.getElementById('shop-items');
        if (!container) return;
        container.innerHTML = '';

        const theme   = filterTheme || window.ThemeManager?.current?.id || 'space';
        const items   = ACCESSORIES.filter(a => !filterTheme || a.theme === theme);

        /* Actualizar monedas en la tienda */
        const coinsEl = document.getElementById('shop-coins');
        if (coinsEl) coinsEl.textContent = window.GS.coins;

        items.forEach(acc => {
            const owned    = window.GS.inventory.has(acc.id);
            const equipped = window.GS.equipped.has(acc.id);
            const canBuy   = window.GS.coins >= acc.price && !owned;

            const card = document.createElement('div');
            card.className = `shop-card ${owned ? 'shop-owned' : ''} ${equipped ? 'shop-equipped' : ''}`;
            card.innerHTML = `
                <div class="shop-item-emoji">${acc.emoji}</div>
                <div class="shop-item-name">${acc.name}</div>
                <div class="shop-item-desc">${acc.desc}</div>
                <div class="shop-item-price">
                    ${owned ? '' : `<span class="price-tag">⭐ ${acc.price}</span>`}
                </div>
                <div class="shop-item-status">
                    ${equipped
                        ? `<span class="status-badge status-equipped">✅ Equipado</span>`
                        : owned
                            ? `<span class="status-badge status-owned">Comprado</span>`
                            : canBuy
                                ? `<span class="status-badge status-buy">¡Comprar!</span>`
                                : `<span class="status-badge status-locked">🔒 ${acc.price}⭐</span>`}
                </div>`;

            /* Acción al hacer click */
            card.addEventListener('click', () => {
                if (equipped) {
                    this.unequip(acc.id);
                } else if (owned) {
                    this.equip(acc.id);
                } else if (canBuy) {
                    this.buy(acc.id);
                } else {
                    this._showToast(`Necesitas ${acc.price} ⭐ para comprar esto`, '#dc2626');
                }
            });

            container.appendChild(card);
        });
    },

    buy(id) {
        const acc = ACCESSORIES.find(a => a.id === id);
        if (!acc) return;
        if (window.GS.inventory.has(id)) {
            this._showToast('¡Ya tienes este accesorio!', '#d97706'); return;
        }
        if (window.GS.coins < acc.price) {
            this._showToast(`Necesitas ${acc.price} ⭐`, '#dc2626'); return;
        }

        window.GS.coins -= acc.price;
        window.GS.inventory.add(id);

        /* Animar estrella-moneda */
        const coinsEl = document.getElementById('shop-coins');
        if (coinsEl) {
            coinsEl.textContent = window.GS.coins;
            coinsEl.classList.remove('coin-bump');
            void coinsEl.offsetWidth;
            coinsEl.classList.add('coin-bump');
        }

        this._showToast(`¡Compraste ${acc.name} ${acc.emoji}!`, '#059669');
        window.Effects?.soundSuccess?.();
        window.Effects?.celebrateConfetti?.(false);
        this.renderShop();
        this._updateAllAvatarDisplays();
        this.checkMissions();
        window.AuthManager?.saveProgress?.();
    },

    equip(id) {
        const acc = ACCESSORIES.find(a => a.id === id);
        if (!acc || !window.GS.inventory.has(id)) return;

        /* Desequipar cualquier otro del mismo slot */
        window.GS.equipped.forEach(eid => {
            const other = ACCESSORIES.find(a => a.id === eid);
            if (other && other.slot === acc.slot) window.GS.equipped.delete(eid);
        });

        window.GS.equipped.add(id);
        this._showToast(`¡${acc.name} equipado! ${acc.emoji}`, '#4f46e5');
        this.renderShop();
        this._updateAllAvatarDisplays();
        window.AuthManager?.saveProgress?.();
    },

    unequip(id) {
        const acc = ACCESSORIES.find(a => a.id === id);
        if (!acc) return;
        window.GS.equipped.delete(id);
        this._showToast(`${acc.name} desequipado`, '#64748b');
        this.renderShop();
        this._updateAllAvatarDisplays();
        window.AuthManager?.saveProgress?.();
    },

    /* ════════════════════════════════════════════════
       HUD & PROGRESO VISUAL
    ════════════════════════════════════════════════ */

    _renderHUD() {
        /* Score principal */
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.textContent = window.GS.completedBlockCount?.() ?? window.GS.totalBlocks;

        /* Estrellas-moneda separadas */
        const coinsHud = document.getElementById('hud-coins');
        if (coinsHud) coinsHud.textContent = window.GS.coins;

        /* Racha */
        const streakEl = document.getElementById('hud-streak');
        if (streakEl) {
            streakEl.textContent = window.GS.streak > 1 ? `🔥 ${window.GS.streak}` : '';
            streakEl.style.display = window.GS.streak > 1 ? 'inline' : 'none';
        }

        /* Avatar en HUD */
        this._updateAllAvatarDisplays();

        /* Misiones activas pendientes */
        const pendingEl = document.getElementById('hud-missions-count');
        if (pendingEl) {
            const pending = MISSIONS_CATALOG.filter(m => !window.GS.missions[m.id]?.completed).length;
            pendingEl.textContent = pending;
        }
    },

    /* ════════════════════════════════════════════════
       PANTALLA DE PERFIL
    ════════════════════════════════════════════════ */

    renderProfile() {
        const av = AVATARS[window.GS.avatarId] || AVATARS.space;

        /* Datos básicos */
        const elName    = document.getElementById('profile-avatar-name');
        const elEmoji   = document.getElementById('profile-avatar-big');
        const elBlocks  = document.getElementById('profile-blocks');
        const elCorrect = document.getElementById('profile-correct');
        const elStreak  = document.getElementById('profile-streak');
        const elCoins   = document.getElementById('profile-coins');
        const elStars   = document.getElementById('profile-stars');

        if (elName)    elName.textContent    = av.name;
        if (elEmoji)   elEmoji.textContent   = this._getAvatarEmoji();
        const completedBlocks = window.GS.completedBlockCount?.() ?? window.GS.totalBlocks;

        if (elBlocks)  elBlocks.textContent  = completedBlocks;
        if (elCorrect) elCorrect.textContent = window.GS.totalCorrect;
        if (elStreak)  elStreak.textContent  = window.GS.bestStreak;
        if (elCoins)   elCoins.textContent   = window.GS.coins;
        if (elStars)   elStars.textContent   = completedBlocks;

        /* Accesorios equipados */
        const eqContainer = document.getElementById('profile-equipped');
        if (eqContainer) {
            eqContainer.innerHTML = '';
            if (window.GS.equipped.size === 0) {
                eqContainer.innerHTML = '<span class="profile-empty">¡Ve a la tienda a conseguir accesorios!</span>';
            } else {
                window.GS.equipped.forEach(eid => {
                    const acc = ACCESSORIES.find(a => a.id === eid);
                    if (!acc) return;
                    const chip = document.createElement('span');
                    chip.className = 'equipped-chip';
                    chip.textContent = `${acc.emoji} ${acc.name}`;
                    eqContainer.appendChild(chip);
                });
            }
        }

        /* Progreso de misiones */
        const totalM    = MISSIONS_CATALOG.length;
        const doneM     = MISSIONS_CATALOG.filter(m => window.GS.missions[m.id]?.completed).length;
        const pctM      = Math.round(doneM / totalM * 100);

        const missionFill = document.getElementById('profile-mission-bar');
        const missionTxt  = document.getElementById('profile-mission-txt');
        if (missionFill) missionFill.style.width = pctM + '%';
        if (missionTxt)  missionTxt.textContent   = `${doneM} / ${totalM} misiones`;
    },

    /* ════════════════════════════════════════════════
       TOAST DE NOTIFICACIÓN
    ════════════════════════════════════════════════ */

    _showToast(msg, color = '#4f46e5') {
        /* Eliminar toast previo si hay */
        document.querySelector('.gm-toast')?.remove();

        const toast = document.createElement('div');
        toast.className = 'gm-toast';
        toast.style.background = color;
        toast.textContent = msg;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('gm-toast-show'));
        setTimeout(() => {
            toast.classList.remove('gm-toast-show');
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    },

    /* ════════════════════════════════════════════════
       ANIMACIÓN DE GANANCIA DE ESTRELLAS
    ════════════════════════════════════════════════ */

    showStarGain(amount = 1) {
        const el = document.createElement('div');
        el.className = 'star-gain-anim';
        el.textContent = `+${amount}⭐`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1200);
    },

};

window.GM = GM;
