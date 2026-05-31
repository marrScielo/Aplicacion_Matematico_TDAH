/**
 * game-state.js — v4 Corregido
 * ─────────────────────────────────────────────────────────
 * - Gestiona el estado reactivo del juego del alumno.
 * - Centraliza las variables de progreso y bloqueos locales/globales.
 */

window.GS = {
    /* ── Progreso dentro del bloque ── */
    questionsInBlock : 0,
    BLOCK_SIZE       : 5,

    /* ── Juego activo ── */
    currentInitFunc  : null,
    currentGameId    : null,
    currentReplayBlockId: null,

    /* ── Completados ── */
    completedGames   : new Set(),

    /* ── Puntuación visual ── */
    totalPoints      : 0,

    /* ── Gamificación ── */
    coins            : 0,
    avatarId         : null,
    inventory        : new Set(),
    equipped         : new Set(),
    missions         : {},
    playMinutes      : 0,
    streak           : 0,
    bestStreak       : 0,
    totalBlocks      : 0,
    totalCorrect     : 0,

    /* ── Perfil del niño ── */
    nombre           : "",
    apellido         : "",
    claseId          : null,

    /* ── Bloqueos en Tiempo Real ── */
    lockedGames       : [], // Bloqueos individuales (este niño)
    globalLockedGames : [], // Bloqueos de todo el salón

    /* ── Bloques desbloqueados por el profesor ── */
    unlockedBlocks : [],

    isGameLocked(gameId) {
        return this.lockedGames.includes(gameId) || this.globalLockedGames.includes(gameId);
    },

    /* ── Helpers ── */
    isBlockComplete() {
        return this.questionsInBlock >= this.BLOCK_SIZE;
    },

    completedBlockCount() {
        return this.completedGames.size;
    },

    startBlock(gameId, initFn) {
        this.currentGameId    = gameId;
        this.currentInitFunc  = initFn;
        this.questionsInBlock = 0;
        this.currentReplayBlockId = this.isDone(gameId) && this.unlockedBlocks.includes(gameId)
            ? gameId
            : null;
        /* Notificar al tracker que empezó un bloque nuevo */
        window.SessionTracker?.startBlock?.();
        window.SessionTracker?.nextQuestion?.();
    },

    registerCorrectAnswer() {
        if (this.isBlockComplete()) return;
        this.questionsInBlock++;
        this.coins++;
        this.totalCorrect++;
        this.streak++;
        if (this.streak > this.bestStreak) this.bestStreak = this.streak;

        window.SessionTracker?.logCorrect?.(this.currentGameId ?? "unknown");
        window.GM?.checkMissions?.();

        /* Preparar tracking de la siguiente pregunta (si no es la última) */
        if (!this.isBlockComplete()) {
            window.SessionTracker?.nextQuestion?.();
        }
    },

    registerWrongAnswer() {
        this.streak = 0;
        window.SessionTracker?.logWrong?.(this.currentGameId ?? "unknown");
    },

    markCurrentDone() {
        if (this.currentGameId) {
            this.completedGames.add(this.currentGameId);
            this.totalBlocks = this.completedBlockCount();
            this.totalPoints = this.totalBlocks;
        }
        window.SessionTracker?.closeSession?.();
        window.GM?.checkMissions?.();
    },

    isDone(gameId) {
        return this.completedGames.has(gameId);
    },

    toFirestore() {
        return {
            coins          : this.coins,
            avatarId       : this.avatarId,
            inventory      : [...this.inventory],
            equipped       : [...this.equipped],
            missions       : this.missions,
            playMinutes    : this.playMinutes,
            bestStreak     : this.bestStreak,
            totalBlocks    : this.totalBlocks,
            totalCorrect   : this.totalCorrect,
            completedGames : [...this.completedGames],
            totalPoints    : this.totalPoints,
            nombre         : this.nombre,
            apellido       : this.apellido,
            claseId        : this.claseId,
            lockedGames    : this.lockedGames,
            unlockedBlocks : this.unlockedBlocks,
        };
    },

    fromFirestore(data) {
        if (!data) return;
        this.coins          = data.coins          ?? 0;
        this.avatarId       = data.avatarId       ?? null;
        this.inventory      = new Set(data.inventory    ?? []);
        this.equipped       = new Set(data.equipped     ?? []);
        this.missions       = data.missions        ?? {};
        this.playMinutes    = data.playMinutes     ?? 0;
        this.bestStreak     = data.bestStreak      ?? 0;
        this.totalCorrect   = data.totalCorrect    ?? 0;
        this.completedGames = new Set(data.completedGames ?? []);
        this.totalBlocks    = this.completedBlockCount();
        this.totalPoints    = this.totalBlocks;
        this.nombre         = data.nombre          ?? "";
        this.apellido       = data.apellido        ?? "";
        this.claseId        = data.claseId         ?? null;
        this.lockedGames    = data.lockedGames     ?? [];
        this.unlockedBlocks = data.unlockedBlocks  ?? [];
    }
};