const Effects = {
    audioCtx: null,
    
    getAudioContext() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) this.audioCtx = new AudioContext();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();
        return this.audioCtx;
    },

    playTone(frequency = 440, duration = 0.12, type = 'sine', volume = 0.08) {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    },

    soundClick() {
        this.playTone(520, 0.07, 'triangle', 0.045);
    },

    soundError() {
        this.playTone(220, 0.12, 'sine', 0.055);
        setTimeout(() => this.playTone(170, 0.16, 'sine', 0.045), 110);
    },

    soundSuccess() {
        this.playTone(523.25, 0.13, 'triangle', 0.065);
        setTimeout(() => this.playTone(659.25, 0.13, 'triangle', 0.065), 120);
        setTimeout(() => this.playTone(783.99, 0.20, 'triangle', 0.075), 240);
    },

    celebrateConfetti() {
        const layer = document.getElementById('confetti-layer');
        if (!layer) return;
        layer.innerHTML = '';
        const colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#FACC15'];
        for (let i = 0; i < 95; i++) {
            const piece = document.createElement('span');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + 'vw';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDuration = (1.8 + Math.random() * 1.7) + 's';
            piece.style.animationDelay = (Math.random() * 0.35) + 's';
            piece.style.transform = `rotate(${Math.random() * 360}deg)`;
            layer.appendChild(piece);
        }
        setTimeout(() => { layer.innerHTML = ''; }, 3900);
    },

    animateScore() {
        const score = document.getElementById('score');
        if (!score) return;
        score.classList.remove('score-bump');
        void score.offsetWidth;
        score.classList.add('score-bump');
    },

    showResultScreen(msg) {
        const resultMessage = document.getElementById('result-message');
        const resultScore = document.getElementById('result-score');
        const stars = document.querySelectorAll('#result-stars span');

        if (resultMessage) resultMessage.innerText = `¡Muy bien! ${msg} Ganaste una estrella por completar el reto.`;
        if (resultScore) resultScore.innerText = points;

        stars.forEach(star => {
            star.style.animation = 'none';
            void star.offsetWidth;
            star.style.animation = '';
        });

        if (window.Navigation && typeof Navigation.goTo === 'function') {
            Navigation.goTo('screen-result');
        } else {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-result')?.classList.add('active');
        }
    },
    
    win(msg) {
        points++; 
        document.getElementById('score').innerText = points;
        
        const fb = document.getElementById('game-feedback');
        fb.innerText = '¡Excelente! ' + msg;
        fb.style.color = 'var(--success)';
        fb.className = 'feedback feedback-success-pop';

        document.getElementById('btn-check').style.display = 'none';
        document.getElementById('btn-reset').style.display = 'none';
        document.getElementById('btn-next').style.display = 'block';

        this.soundSuccess();
        this.animateScore();
        this.celebrateConfetti();

        setTimeout(() => this.showResultScreen(msg), 650);
    },

    fail(msg) {
        const fb = document.getElementById('game-feedback');
        fb.innerHTML = '¡Ups! ' + msg + ' <br>¡Inténtalo otra vez!';
        fb.className = 'feedback shake-anim';
        fb.style.color = 'var(--danger)';
        this.soundError();
        setTimeout(() => fb.classList.remove('shake-anim'), 500);
    },

    clear() {
        document.getElementById('game-feedback').innerText = '';
        document.getElementById('game-feedback').className = 'feedback';
        document.getElementById('btn-check').style.display = 'block';
        document.getElementById('btn-reset').style.display = 'block';
        document.getElementById('btn-next').style.display = 'none';
    },

    resetLevel() {
        // Lógica de devolver elementos al bot
        const bot = document.getElementById('game-bot');
        document.querySelectorAll('.target .drag-item').forEach(el => {
            el.style.position = 'relative';
            bot.appendChild(el);
        });
        document.querySelectorAll('.click-item').forEach(el => {
            el.style.transform = 'scale(1)';
            el.classList.remove('destroyed');
        });
        if (gameState) gameState.destroyed = 0;
        if (gameState && (gameState.cloned !== undefined || gameState.r !== undefined)) {
            currentInitFunc();
        }
        this.soundClick();
        this.clear();
    },

    attachGlobalClickSound() {
        document.addEventListener('click', (event) => {
            if (event.target.closest('button')) this.soundClick();
        }, true);
    }
};
