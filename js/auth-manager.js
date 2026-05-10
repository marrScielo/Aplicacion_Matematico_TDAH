// js/auth-manager.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Credenciales oficiales de tu proyecto MathADHD
const firebaseConfig = {
  apiKey: "AIzaSyC2cBewSZrETvRMwUq4TLrTFrcfgsArxn8",
  authDomain: "math-tdah-app.firebaseapp.com",
  projectId: "math-tdah-app",
  storageBucket: "math-tdah-app.firebasestorage.app",
  messagingSenderId: "123946867099",
  appId: "1:123946867099:web:792ca657f32f2e7963293e"
};

// Inicializamos Firebase una única vez en este módulo
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function loginAutomatico() {
    try {
        const credencial = await signInAnonymously(auth);
        const uid = credencial.user.uid;
        const userRef = doc(db, "usuarios", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                nombre: "Astronauta Nuevo", 
                puntaje: 0,
                nivel: 1,
                creado: new Date() 
            });
        }

        localStorage.setItem("uid", uid);
        return true;
    } catch (error) {
        console.error("Error en Firebase:", error);
        return false;
    }
}

/**
 * Incrementa las estrellas del usuario directamente en la base de datos de la nube.
 */
export async function guardarEstrellas(puntosNuevos) {
    const uid = localStorage.getItem("uid");
    if (!uid) return;

    try {
        const userRef = doc(db, "usuarios", uid);
        await updateDoc(userRef, {
            estrellas: increment(puntosNuevos)
        });
        console.log(`⭐ Sincronizadas +${puntosNuevos} estrellas en la nube.`);
    } catch (e) {
        console.error("❌ Error al guardar estrellas en Firebase:", e);
    }
}
