/**
 * game-state.js
 * ─────────────────────────────────────────────────────────
 * Fuente única de verdad para TODO el estado del juego.
 * v2: Incorpora modelo de gamificación completo (avatar,
 * estrellas-moneda, inventario, misiones, progreso).
 */

window.GS = {
    /* ── Progreso dentro del bloque (juego actual) ── */
    questionsInBlock : 0,
    BLOCK_SIZE       : 5,

    /* ── Función de inicialización del juego activo ── */
    currentInitFunc  : null,
    currentGameId    : null,

    /* ── Juegos completados (sesión + persistencia) ── */
    completedGames   : new Set(),

    /* ── Puntaje global de estrellas (contador visual) ── */
    totalPoints      : 0,

    /* ═══════════════════════════════════════════════
       GAMIFICACIÓN — modelo persistido en Firestore
    ═══════════════════════════════════════════════ */

    /* Estrellas como moneda virtual de la tienda */
    coins            : 0,

    /* Avatar elegido: 'space' | 'explorer' | 'hero' | null */
    avatarId         : null,

    /* Accesorios comprados: Set de IDs de string */
    inventory        : new Set(),

    /* Accesorios equipados: Set de IDs de string */
    equipped         : new Set(),

    /* Misiones: { id, completed, progress, rewardGiven } */
    missions         : {},

    /* Tiempo de juego acumulado (minutos) */
    playMinutes      : 0,

    /* Rachas: respuestas correctas seguidas */
    streak           : 0,
    bestStreak       : 0,

    /* Bloques completados totales */
    totalBlocks      : 0,

    /* Total de respuestas correctas */
    totalCorrect     : 0,

    /* ── Helpers ──────────────────────────────────── */
    isBlockComplete() {
        return this.questionsInBlock >= this.BLOCK_SIZE;
    },

    startBlock(gameId, initFn) {
        this.currentGameId    = gameId;
        this.currentInitFunc  = initFn;
        this.questionsInBlock = 0;
    },

    registerCorrectAnswer() {
        if (this.isBlockComplete()) return;
        this.questionsInBlock++;
        this.totalPoints++;
        this.coins++;
        this.totalCorrect++;
        this.streak++;
        if (this.streak > this.bestStreak) this.bestStreak = this.streak;

        /* Disparar cheques de misiones */
        window.GM?.checkMissions?.();
    },

    registerWrongAnswer() {
        this.streak = 0;
    },

    markCurrentDone() {
        if (this.currentGameId) {
            this.completedGames.add(this.currentGameId);
            this.totalBlocks++;
        }
        window.GM?.checkMissions?.();
    },

    isDone(gameId) {
        return this.completedGames.has(gameId);
    },

    /* Serializar para Firestore */
    toFirestore() {
        return {
            coins         : this.coins,
            avatarId      : this.avatarId,
            inventory     : [...this.inventory],
            equipped      : [...this.equipped],
            missions      : this.missions,
            playMinutes   : this.playMinutes,
            bestStreak    : this.bestStreak,
            totalBlocks   : this.totalBlocks,
            totalCorrect  : this.totalCorrect,
            completedGames: [...this.completedGames],
            totalPoints   : this.totalPoints,
        };
    },

    /* Cargar desde Firestore */
    fromFirestore(data) {
        if (!data) return;
        this.coins         = data.coins         ?? 0;
        this.avatarId      = data.avatarId       ?? null;
        this.inventory     = new Set(data.inventory    ?? []);
        this.equipped      = new Set(data.equipped     ?? []);
        this.missions      = data.missions       ?? {};
        this.playMinutes   = data.playMinutes    ?? 0;
        this.bestStreak    = data.bestStreak     ?? 0;
        this.totalBlocks   = data.totalBlocks    ?? 0;
        this.totalCorrect  = data.totalCorrect   ?? 0;
        this.completedGames= new Set(data.completedGames ?? []);
        this.totalPoints   = data.totalPoints    ?? data.coins ?? 0;
    }
};
