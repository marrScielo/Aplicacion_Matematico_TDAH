/**
 * session-tracker.js — v4: logging detallado por pregunta
 * ─────────────────────────────────────────────────────────────────
 * Registra:
 *   - sesiones/{auto}         → resumen de la sesión
 *   - eventos/{auto}          → cada respuesta individual con tiempo
 *
 * NUEVO v4:
 *   - Tracking de tiempo por pregunta (qStartedAt)
 *   - intentos por pregunta antes de acertar (attemptsMap)
 *   - avgTimePerQuestion guardado en la sesión
 *   - logCorrect / logWrong exponen datos ricos para el dashboard
 */

import {
    collection, addDoc, doc, setDoc, updateDoc,
    serverTimestamp, increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const SessionTracker = (() => {

    let _db          = null;
    let _uid         = null;
    let _sessionRef  = null;
    let _claseId     = null;
    let _startedAt   = null;
    let _correct     = 0;
    let _wrong       = 0;

    /* Por pregunta dentro del bloque */
    let _questionIndex  = 0;   // índice 1-5 dentro del bloque
    let _qStartedAt     = null; // cuándo empezó la pregunta actual
    let _attemptsMap    = {};   // { questionIndex: intentos_fallidos }
    let _timesMap       = {};   // { questionIndex: segundos }

    /* ── Inicializar al hacer login ─────────────────────── */
    async function init(uid, db, claseId = null) {
        _uid       = uid;
        _db        = db;
        _claseId   = claseId;
        _startedAt = Date.now();
        _correct   = 0;
        _wrong     = 0;
        _resetBlockTracking();

        try {
            _sessionRef = doc(collection(_db, "sesiones"));
            await setDoc(_sessionRef, {
                uid,
                claseId        : claseId ?? null,
                iniciadaEn     : serverTimestamp(),
                cerradaEn      : null,
                totalCorrectas : 0,
                totalErradas   : 0,
                juegosJugados  : [],
                duracionMin    : 0,
                avgTimeSecs    : 0,
                attemptsDetail : {},   // { "q1": 0, "q2": 2, ... }
                timesDetail    : {},   // { "q1": 8.3, "q2": 15.1, ... }
            });
        } catch (e) {
            console.warn("[SessionTracker] No se pudo crear sesión:", e);
        }

        window.addEventListener("beforeunload", () => closeSession());
    }

    /* ── Llamar al inicio de cada bloque (desde GS.startBlock) ── */
    function startBlock() {
        _resetBlockTracking();
    }

    function _resetBlockTracking() {
        _questionIndex = 0;
        _qStartedAt    = Date.now();
        _attemptsMap   = {};
        _timesMap      = {};
    }

    /* ── Nueva pregunta comenzó ── */
    function nextQuestion() {
        _questionIndex++;
        _qStartedAt = Date.now();
        if (!_attemptsMap[_questionIndex]) _attemptsMap[_questionIndex] = 0;
    }

    /* ── Registrar respuesta correcta ─────────────────── */
    async function logCorrect(gameId) {
        if (!_db || !_uid) return;
        _correct++;

        const timeSecs = _qStartedAt ? (Date.now() - _qStartedAt) / 1000 : 0;
        _timesMap[_questionIndex] = parseFloat(timeSecs.toFixed(1));

        try {
            await addDoc(collection(_db, "eventos"), {
                uid         : _uid,
                claseId     : _claseId ?? null,
                sessionId   : _sessionRef?.id ?? null,
                gameId,
                tipo        : "correcta",
                questionIdx : _questionIndex,
                intentosFallidos: _attemptsMap[_questionIndex] ?? 0,
                tiempoSecs  : parseFloat(timeSecs.toFixed(1)),
                ts          : serverTimestamp(),
                streak      : window.GS?.streak ?? 0,
            });

            if (_sessionRef) {
                /* Calcular avg de tiempos conocidos */
                const times   = Object.values(_timesMap);
                const avgTime = times.length
                    ? parseFloat((times.reduce((a,b)=>a+b,0)/times.length).toFixed(1))
                    : 0;

                await updateDoc(_sessionRef, {
                    totalCorrectas : increment(1),
                    juegosJugados  : _uniqueAppend(gameId),
                    avgTimeSecs    : avgTime,
                    attemptsDetail : _attemptsMap,
                    timesDetail    : _timesMap,
                });
            }
        } catch (e) { /* silencioso */ }
    }

    /* ── Registrar respuesta incorrecta ─────────────────── */
    async function logWrong(gameId) {
        if (!_db || !_uid) return;
        _wrong++;

        /* Acumular intento fallido en la pregunta actual */
        if (!_attemptsMap[_questionIndex]) _attemptsMap[_questionIndex] = 0;
        _attemptsMap[_questionIndex]++;

        try {
            await addDoc(collection(_db, "eventos"), {
                uid         : _uid,
                claseId     : _claseId ?? null,
                sessionId   : _sessionRef?.id ?? null,
                gameId,
                tipo        : "errada",
                questionIdx : _questionIndex,
                ts          : serverTimestamp(),
            });
            if (_sessionRef) {
                await updateDoc(_sessionRef, {
                    totalErradas   : increment(1),
                    attemptsDetail : _attemptsMap,
                });
            }
        } catch (e) { /* silencioso */ }
    }

    /* ── Cerrar sesión ─────────────────────────────────── */
    async function closeSession() {
        if (!_sessionRef || !_db) return;
        const mins = Math.round((Date.now() - _startedAt) / 60000);
        try {
            await updateDoc(_sessionRef, {
                cerradaEn  : serverTimestamp(),
                duracionMin: mins,
            });
            if (_uid) {
                const userRef = doc(_db, "usuarios", _uid);
                await updateDoc(userRef, { playMinutes: increment(mins) });
            }
        } catch (e) { /* silencioso */ }
    }

    /* ── Helper: lista única ── */
    const _seen = new Set();
    function _uniqueAppend(gameId) {
        _seen.add(gameId);
        return [..._seen];
    }

    return { init, startBlock, nextQuestion, logCorrect, logWrong, closeSession };
})();

window.SessionTracker = SessionTracker;
