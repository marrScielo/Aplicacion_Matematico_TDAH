

window.GS = {
    // ── Progreso dentro del bloque (juego actual) ──
    questionsInBlock : 0,   // preguntas respondidas correctamente en este bloque
    BLOCK_SIZE       : 5,   // preguntas requeridas para completar un bloque

    // ── Función de inicialización del juego activo ──
    currentInitFunc  : null,  // () => void  — la función del mini-juego elegido
    currentGameId    : null,  // string      — "add-0", "sub-2", etc.

    // ── Juegos completados (persiste en la sesión) ──
    completedGames   : new Set(),

    // ── Puntaje global de estrellas ──
    totalPoints      : 0,

    // ── Helpers ──────────────────────────────────────
    isBlockComplete() {
        return this.questionsInBlock >= this.BLOCK_SIZE;
    },

    startBlock(gameId, initFn) {
        this.currentGameId    = gameId;
        this.currentInitFunc  = initFn;
        this.questionsInBlock = 0;
    },

    registerCorrectAnswer() {
        if (this.isBlockComplete()) return;   // ya no suma si ya completó
        this.questionsInBlock++;
        this.totalPoints++;
    },

    markCurrentDone() {
        if (this.currentGameId) {
            this.completedGames.add(this.currentGameId);
        }
    },

    isDone(gameId) {
        return this.completedGames.has(gameId);
    }
};
