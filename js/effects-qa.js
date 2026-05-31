/**
 * effects-qa.js  — v2: hooks de gamificación integrados
 */

const Effects = {
    audioCtx : null,
    muted    : false,
    autoNextTimer: null,

    _ctx() {
        if (!this.audioCtx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) this.audioCtx = new AC();
        }
        if (this.audioCtx?.state === 'suspended') this.audioCtx.resume();
        return this.audioCtx;
    },

    playTone(freq = 440, dur = 0.12, type = 'sine', vol = 0.08) {
        if (this.muted) return;
        const ctx = this._ctx();
        if (!ctx) return;
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
    },

    soundClick()   { this.playTone(520, 0.07, 'triangle', 0.045); },
    soundError()   {
        this.playTone(220, 0.12, 'sine', 0.055);
        setTimeout(() => this.playTone(170, 0.16, 'sine', 0.045), 110);
    },
    soundSuccess() {
        this.playTone(523.25, 0.13, 'triangle', 0.065);
        setTimeout(() => this.playTone(659.25, 0.13, 'triangle', 0.065), 120);
        setTimeout(() => this.playTone(783.99, 0.20, 'triangle', 0.075), 240);
    },
    soundComplete() {
        [523, 659, 784, 1047].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.22, 'triangle', 0.08), i * 130);
        });
    },

    celebrateConfetti(intense = false) {
        const layer = document.getElementById('confetti-layer');
        if (!layer) return;
        layer.innerHTML = '';
        const colors = this._themeColors || ['#2563EB','#10B981','#F59E0B','#EF4444','#8B5CF6','#FACC15','#EC4899'];
        const count  = intense ? 160 : 80;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('span');
            p.className = 'confetti-piece';
            p.style.cssText = `
                left:${Math.random()*100}vw;
                background:${colors[Math.floor(Math.random()*colors.length)]};
                animation-duration:${(1.6 + Math.random()*1.8).toFixed(2)}s;
                animation-delay:${(Math.random()*0.4).toFixed(2)}s;
                transform:rotate(${Math.floor(Math.random()*360)}deg);
                width:${8 + Math.floor(Math.random()*10)}px;
                height:${10 + Math.floor(Math.random()*14)}px;
            `;
            layer.appendChild(p);
        }
        setTimeout(() => { layer.innerHTML = ''; }, intense ? 5000 : 3500);
    },

    animateScore() {
        const score = document.getElementById('score');
        if (!score) return;
        score.classList.remove('score-bump');
        void score.offsetWidth;
        score.classList.add('score-bump');
    },

    _showResultScreen(msg) {
        window.Navigation?.showResult();

        const resultMessage = document.getElementById('result-message');
        const resultScore   = document.getElementById('result-score');
        const scoreEl       = document.getElementById('score');
        const stars         = document.querySelectorAll('#result-stars span');
        const completedBlocks = window.GS.completedBlockCount?.() ?? window.GS.totalBlocks;

        if (resultMessage) resultMessage.innerText =
            `¡Increíble! ${msg} Completaste las 5 misiones del bloque.`;
        if (resultScore) resultScore.innerText = completedBlocks;
        if (scoreEl) scoreEl.innerText = completedBlocks;

        stars.forEach(star => {
            star.style.animation = 'none';
            void star.offsetWidth;
            star.style.animation = '';
        });

    },

    win(msg) {
        if (this.autoNextTimer) {
            clearTimeout(this.autoNextTimer);
            this.autoNextTimer = null;
        }

        window.GS.registerCorrectAnswer();

        /* Actualizar score */
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.innerText = window.GS.completedBlockCount?.() ?? window.GS.totalBlocks;

        if (window.AppUX?.onExerciseWin) window.AppUX.onExerciseWin();

        const fb = document.getElementById('game-feedback');
        if (fb) {
            fb.innerText   = '¡Excelente! 🌟 ' + msg;
            fb.style.color = 'var(--success)';
            fb.className   = 'feedback feedback-success-pop';
        }

        this.animateScore();

        if (window.GS.isBlockComplete()) {
            window.GM?.showStarGain?.(1);
            this.soundComplete();
            this.celebrateConfetti(true);
            this._setActionButtons('done');
            setTimeout(() => this._showResultScreen(msg), 900);
        } else {
            this.soundSuccess();
            this.celebrateConfetti(false);
            this._setActionButtons('done');
            this.autoNextTimer = setTimeout(() => {
                this.autoNextTimer = null;
                this._setActionButtons('normal');
                window.Navigation?.nextQuestion();
            }, 850);
        }
    },

    fail(msg) {
        /* Registrar fallo para romper racha */
        window.GS.registerWrongAnswer?.();
        window.GM?.checkMissions?.();

        const fb = document.getElementById('game-feedback');
        if (fb) {
            fb.innerHTML   = '¡Ups! ' + msg + '<br><small>¡Inténtalo de nuevo!</small>';
            fb.className   = 'feedback shake-anim';
            fb.style.color = 'var(--danger)';
        }
        this.soundError();
        setTimeout(() => { if (fb) fb.classList.remove('shake-anim'); }, 500);
    },

    clear() {
        if (this.autoNextTimer) {
            clearTimeout(this.autoNextTimer);
            this.autoNextTimer = null;
        }
        const fb = document.getElementById('game-feedback');
        if (fb) { fb.innerText = ''; fb.className = 'feedback'; }
        this._setActionButtons('normal');
    },

    resetLevel() {
        const bot = document.getElementById('game-bot');
        document.querySelectorAll('.target .drag-item').forEach(el => {
            el.style.position = 'relative';
            bot?.appendChild(el);
        });
        document.querySelectorAll('.click-item').forEach(el => {
            el.style.transform = 'scale(1)';
            el.classList.remove('destroyed');
        });
        if (window.GS?.currentInitFunc) {
            this.clear();
            window.GS.currentInitFunc();
        } else {
            this.clear();
        }
        this.soundClick();
    },

    _setActionButtons(mode) {
        const check = document.getElementById('btn-check');
        const reset = document.getElementById('btn-reset');
        const next  = document.getElementById('btn-next');
        if (!check || !reset || !next) return;

        switch (mode) {
            case 'normal':
                check.style.display = 'block';
                reset.style.display = 'block';
                next.style.display  = 'none';
                break;
            case 'next':
                check.style.display = 'none';
                reset.style.display = 'none';
                next.style.display  = 'block';
                next.textContent    = `¡Siguiente misión! (${window.GS.questionsInBlock}/${window.GS.BLOCK_SIZE})`;
                break;
            case 'done':
                check.style.display = 'none';
                reset.style.display = 'none';
                next.style.display  = 'none';
                break;
        }
    },

    attachGlobalClickSound() {
        document.addEventListener('click', e => {
            const btn = e.target.closest('button');
            if (!btn) return;
            if (btn.dataset.noSound === '1') return;
            this.soundClick();
        }, true);
    }
};

window.Effects = Effects;
