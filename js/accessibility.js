/**
 * accessibility.js
 * ─────────────────────────────────────────────────────────
 * Voz (SpeechSynthesis) + barra de progreso del bloque (5 retos)
 */

(function () {
    const STORAGE_KEY_AUDIO = 'mathadhd_audio_enabled';
    const STORAGE_KEY_VOICE_LEGACY = 'mathadhd_voice_enabled';
    const BLOCK_TOTAL = 5;

    let audioEnabled = true;
    let blockDone = 0;
    let preferredVoice = null;

    /* ── 1. CARGAR LAS MEJORES VOCES DISPONIBLES ── */
    function loadVoices() {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return;

        // Filtrar voces en español
        const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
        
        // Prioridad: Voces de Google (suelen ser en la nube y muy naturales), luego Microsoft Sabina/Helena/Laura
        preferredVoice = spanishVoices.find(v => v.name.includes('Google')) ||
                         spanishVoices.find(v => v.name.includes('Sabina') || v.name.includes('Helena') || v.name.includes('Laura')) ||
                         spanishVoices.find(v => v.name.includes('Natural')) ||
                         spanishVoices[0]; // Fallback a la primera en español si no encuentra las otras
    }

    // Los navegadores cargan las voces de forma asíncrona
    if ('speechSynthesis' in window) {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    function getBoolFromStorage(key, fallback) {
        try {
            const v = localStorage.getItem(key);
            if (v === null) return fallback;
            return v === '1' || v === 'true';
        } catch (_) {
            return fallback;
        }
    }

    function setBoolToStorage(key, val) {
        try {
            localStorage.setItem(key, val ? '1' : '0');
        } catch (_) {}
    }

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }

    function setProgressUI(done) {
        const fill = document.getElementById('block-progress-fill');
        const text = document.getElementById('block-progress-text');
        const track = document.getElementById('block-progress-track');
        const pct = (done / BLOCK_TOTAL) * 100;
        if (fill) fill.style.width = pct + '%';
        if (text) text.innerText = `${done}/${BLOCK_TOTAL}`;
        if (track) track.setAttribute('aria-valuenow', String(done));
    }

    /* ── 2. ELIMINAR EMOJIS DEL TEXTO PARA LA LECTURA ── */
    function htmlToSpeakableText(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html || '';
        let text = (tmp.innerText || tmp.textContent || '');
        
        // Expresión regular moderna para detectar y borrar emojis y símbolos pictográficos
        text = text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
        
        // Limpiar espacios dobles o saltos de línea que dejen los emojis al desaparecer
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }

    function stopSpeech() {
        if (!('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
        } catch (_) {}
    }

    /* ── 3. HABLAR CON VOZ NATURAL ── */
    function speak(text) {
        if (!audioEnabled) return;
        if (!text) return;
        if (!('speechSynthesis' in window)) return;

        try {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            
            // Configuración de la voz para que suene menos "robot" y más amigable
            u.lang = 'es-ES';
            u.rate = 0.95; // Un 5% más lento ayuda a que la dicción sea más clara para los niños
            u.pitch = 1.1; // Ligeramente más agudo para un tono más amistoso
            u.volume = 1.0;
            
            if (preferredVoice) {
                u.voice = preferredVoice;
            }

            window.speechSynthesis.speak(u);
        } catch (_) {}
    }

    function setAudioEnabled(next) {
        audioEnabled = !!next;
        setBoolToStorage(STORAGE_KEY_AUDIO, audioEnabled);
        const toggle = document.getElementById('voice-toggle');
        if (toggle) toggle.setAttribute('aria-pressed', audioEnabled ? 'true' : 'false');

        if (globalThis.Effects) globalThis.Effects.muted = !audioEnabled;

        if (!audioEnabled) stopSpeech();
    }

    function openSettings() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeSettings() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }

    function initUI() {
        const storedAudio = getBoolFromStorage(STORAGE_KEY_AUDIO, null);
        if (storedAudio === null) {
            audioEnabled = getBoolFromStorage(STORAGE_KEY_VOICE_LEGACY, true);
        } else {
            audioEnabled = storedAudio;
        }
        setAudioEnabled(audioEnabled);
        setProgressUI(blockDone);

        const settingsBtn = document.getElementById('btn-settings');
        const modal = document.getElementById('settings-modal');
        const closeBtn = document.getElementById('settings-close');
        const toggle = document.getElementById('voice-toggle');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openSettings();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeSettings();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeSettings();
            });
        }

        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                setAudioEnabled(!audioEnabled);
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeSettings();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopSpeech();
        });
    }

    window.AppUX = {
        startBlock() {
            blockDone = 0;
            setProgressUI(blockDone);
        },
        onExerciseWin() {
            blockDone = clamp(blockDone + 1, 0, BLOCK_TOTAL);
            setProgressUI(blockDone);
        },
        onNewInstruction(html) {
            const text = htmlToSpeakableText(html);
            speak(text);
        },
        setAudioEnabled(on) {
            setAudioEnabled(!!on);
        },
        setFocusMode(on) {
            document.body.classList.toggle('focus-mode', !!on);
            if (!on) stopSpeech();
        }
    };

    document.addEventListener('DOMContentLoaded', initUI);
})();