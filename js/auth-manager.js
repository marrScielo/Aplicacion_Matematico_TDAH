// js/auth-manager.js — v4: nombre/apellido + login simple para profesor + Control Global
import { initializeApp }       from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, signInWithEmailAndPassword, signOut }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment,
         collection, query, where, getDocs, arrayUnion, onSnapshot }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { SessionTracker } from "./session-tracker.js";

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

window.DB_INSTANCE = db;

let _uid     = null;
let _claseId = null;
let _userUnsubscribe = null;
let _claseUnsubscribe = null;

/* ════════════════════════════════════════════════════
   LOGIN AUTOMÁTICO (anónimo) — flujo del niño
════════════════════════════════════════════════════ */
export async function loginAutomatico() {
    try {
        // 1. Borramos el rastro del navegador
        localStorage.removeItem("uid");
        localStorage.removeItem("gs_backup");
        window.GS.nombre = "";
        window.GS.apellido = "";
        
        // 🔴 2. LA MAGIA: Obligamos a Firebase a "olvidar" la sesión fantasma anterior
        await signOut(auth); 

        // 3. Creamos un usuario 100% nuevo
        const cred = await signInAnonymously(auth);
        _uid = cred.user.uid;
        
        const userRef  = doc(db, "usuarios", _uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            const inicial = {
                nombre       : "",
                apellido     : "",
                puntaje      : 0,
                nivel        : 1,
                creado       : new Date(),
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
                claseId      : null,
                lockedGames  : []
            };
            await setDoc(userRef, inicial);
            window.GS.fromFirestore(inicial);
        } else {
            const data = userSnap.data();
            _claseId   = data.claseId ?? null;
            window.GS.fromFirestore(data);
        }

        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.innerText = window.GS.completedBlockCount?.() ?? window.GS.totalBlocks;

        localStorage.setItem("uid", _uid);

        await SessionTracker.init(_uid, db, _claseId);
        _startUserRealtimeListener(userRef);

        if (_claseId) {
            _startClaseRealtimeListener(_claseId);
        }

        window.AuthManager = {
            saveProgress,
            vincularConProfesor,
            guardarNombreAlumno,
            tieneNombre: () => !!(window.GS.nombre && window.GS.nombre.trim()),
            getUid: () => _uid,
        };

        return true;
    } catch (error) {
        console.error("Error en Firebase:", error);
        _loadLocalFallback();
        window.AuthManager = {
            saveProgress: _saveLocalFallback,
            vincularConProfesor: () => {},
            guardarNombreAlumno: () => {},
            tieneNombre: () => false,
            getUid: () => null,
        };
        return true;
    }
}
function _startUserRealtimeListener(userRef) {
    if (_userUnsubscribe) _userUnsubscribe();

    _userUnsubscribe = onSnapshot(userRef, snap => {
        if (!snap.exists()) return;
        const data = snap.data();

        // 1. Detectar bloqueos individuales
        const beforeLocks = JSON.stringify(window.GS.lockedGames ?? []);
        window.GS.fromFirestore(data);
        const afterLocks = JSON.stringify(window.GS.lockedGames ?? []);
        if (beforeLocks !== afterLocks) {
            window.dispatchEvent(new CustomEvent('locksChanged'));
        }

        // 2. Detectar si el profesor nos EXPULSÓ o si entramos a una clase
        const nuevaClaseId = data.claseId ?? null;
        if (nuevaClaseId !== _claseId) {
            _claseId = nuevaClaseId;
            const uid = auth.currentUser?.uid || localStorage.getItem('uid');
            
            if (_claseId) {
                if (uid) localStorage.setItem('claseId_' + uid, _claseId);
                if (typeof _startClaseRealtimeListener === 'function') _startClaseRealtimeListener(_claseId);
            } else {
                if (uid) localStorage.removeItem('claseId_' + uid);
                if (typeof _claseUnsubscribe === 'function' && _claseUnsubscribe) {
                    _claseUnsubscribe();
                    _claseUnsubscribe = null;
                }
                window.GS.globalLockedGames = []; 
                window.dispatchEvent(new CustomEvent('claseExpulsada')); 
                window.dispatchEvent(new CustomEvent('locksChanged')); // Destrabar todo visualmente
            }
        }

        window.GM?._renderHUD?.();
    });
}

/* ── Escuchar los bloqueos del salón GLOBAL ── */
function _startClaseRealtimeListener(claseId) {
    if (_claseUnsubscribe) _claseUnsubscribe();
    if (!claseId) return;

    _claseUnsubscribe = onSnapshot(doc(db, "clases", claseId), snap => {
        if (!snap.exists()) return;
        const data = snap.data();
        
        const before = JSON.stringify(window.GS.globalLockedGames ?? []);
        window.GS.globalLockedGames = data.lockedGames ?? [];
        const after = JSON.stringify(window.GS.globalLockedGames);

        // Si el profesor cambió los bloqueos globales, avisar a la pantalla del niño
        if (before !== after) window.dispatchEvent(new CustomEvent('locksChanged'));
    });
}

/* ════════════════════════════════════════════════════
   GUARDAR NOMBRE Y APELLIDO DEL NIÑO
════════════════════════════════════════════════════ */
export async function guardarNombreAlumno(nombre, apellido) {
    const uid = _uid || localStorage.getItem("uid");
    if (!uid) return false;
    try {
        window.GS.nombre   = nombre.trim();
        window.GS.apellido = apellido.trim();
        await updateDoc(doc(db, "usuarios", uid), {
            nombre  : window.GS.nombre,
            apellido: window.GS.apellido,
        });
        return true;
    } catch(e) {
        console.error("Error guardando nombre:", e);
        return false;
    }
}

export async function loginProfesor(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
}

export async function logoutProfesor() {
    await signOut(auth);
}

export async function vincularConProfesor(codigoClase) {
    if (!_uid) return { ok: false, msg: "Sin sesión activa" };
    try {
        const clasesRef = collection(db, "clases");
        const q = query(clasesRef, where("codigo", "==", codigoClase.toUpperCase()));
        const snap = await getDocs(q);
        if (snap.empty) return { ok: false, msg: "Código de clase no encontrado" };

        const claseDoc = snap.docs[0];
        _claseId = claseDoc.id;

        await updateDoc(doc(db, "clases", _claseId), { alumnos: arrayUnion(_uid) });
        await updateDoc(doc(db, "usuarios", _uid), { claseId: _claseId });

        window.GS.claseId = _claseId;

        await SessionTracker.closeSession();
        await SessionTracker.init(_uid, db, _claseId);

        return { ok: true, msg: "¡Te uniste a la clase de tu profe! 🎉" };
    } catch (e) {
        console.error("Error vinculando:", e);
        return { ok: false, msg: "Error al unirse. Intenta de nuevo." };
    }
}

export async function saveProgress() {
    const uid = _uid || localStorage.getItem("uid");
    if (!uid) return;
    try {
        await updateDoc(doc(db, "usuarios", uid), window.GS.toFirestore());
        _saveLocalFallback();
    } catch (e) {
        console.error("❌ Error al guardar:", e);
        _saveLocalFallback();
    }
}

export async function guardarEstrellas(puntosNuevos) {
    const uid = _uid || localStorage.getItem("uid");
    if (!uid) return;
    try {
        await updateDoc(doc(db, "usuarios", uid), { puntaje: increment(puntosNuevos) });
    } catch (e) { }
}

function _saveLocalFallback() {
    try { localStorage.setItem('gs_backup', JSON.stringify(window.GS.toFirestore())); } catch(e) {}
}
function _loadLocalFallback() {
    try {
        const raw = localStorage.getItem('gs_backup');
        if (raw) window.GS.fromFirestore(JSON.parse(raw));
    } catch(e) {}
}

export { db };