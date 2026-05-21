// js/auth-manager.js  — v2: persiste modelo de gamificación completo
import { initializeApp }       from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey            : "AIzaSyC2cBewSZrETvRMwUq4TLrTFrcfgsArxn8",
  authDomain        : "math-tdah-app.firebaseapp.com",
  projectId         : "math-tdah-app",
  storageBucket     : "math-tdah-app.firebasestorage.app",
  messagingSenderId : "123946867099",
  appId             : "1:123946867099:web:792ca657f32f2e7963293e"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

let _uid = null;

/* ── Login automático (anónimo) + carga de datos ── */
export async function loginAutomatico() {
    try {
        const cred = await signInAnonymously(auth);
        _uid = cred.user.uid;
        const userRef  = doc(db, "usuarios", _uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            /* Usuario nuevo */
            const inicial = {
                nombre      : "Jugador Nuevo",
                puntaje     : 0,
                nivel       : 1,
                creado      : new Date(),
                /* gamificación */
                coins        : 0,
                avatarId     : null,
                inventory    : [],
                equipped     : [],
                missions     : {},
                playMinutes  : 0,
                bestStreak   : 0,
                totalBlocks  : 0,
                totalCorrect : 0,
                completedGames: [],
                totalPoints  : 0,
            };
            await setDoc(userRef, inicial);
            window.GS.fromFirestore(inicial);
        } else {
            const data = userSnap.data();
            window.GS.fromFirestore(data);
            console.log("✅ Datos cargados de Firebase:", data.totalPoints, "pts");
        }

        /* Sincronizar UI */
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.innerText = window.GS.totalPoints;

        localStorage.setItem("uid", _uid);

        /* Exponer función de guardado al scope global */
        window.AuthManager = { saveProgress };

        return true;
    } catch (error) {
        console.error("Error en Firebase:", error);
        /* Fallback: cargar desde localStorage si Firebase falla */
        _loadLocalFallback();
        window.AuthManager = { saveProgress: _saveLocalFallback };
        return true;   // devolver true para no bloquear la UI
    }
}

/* ── Guardar progreso completo ── */
export async function saveProgress() {
    const uid = _uid || localStorage.getItem("uid");
    if (!uid) return;
    try {
        const userRef = doc(db, "usuarios", uid);
        await updateDoc(userRef, window.GS.toFirestore());
        _saveLocalFallback();   // respaldo local siempre
        console.log("💾 Progreso guardado.");
    } catch (e) {
        console.error("❌ Error al guardar:", e);
        _saveLocalFallback();
    }
}

/* ── Guardar solo estrellas (backward-compat) ── */
export async function guardarEstrellas(puntosNuevos) {
    const uid = _uid || localStorage.getItem("uid");
    if (!uid) return;
    try {
        const userRef = doc(db, "usuarios", uid);
        await updateDoc(userRef, { puntaje: increment(puntosNuevos) });
    } catch (e) {
        console.error("❌ Error al guardar estrellas:", e);
    }
}

/* ── Fallback localStorage ── */
function _saveLocalFallback() {
    try {
        const d = window.GS.toFirestore();
        localStorage.setItem('gs_backup', JSON.stringify(d));
    } catch(e) {}
}

function _loadLocalFallback() {
    try {
        const raw = localStorage.getItem('gs_backup');
        if (raw) window.GS.fromFirestore(JSON.parse(raw));
    } catch(e) {}
}
