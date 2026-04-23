const Effects = {
    win(msg) {
        points++; 
        document.getElementById('score').innerText = points;
        let fb = document.getElementById('game-feedback');
        fb.innerText = "¡Excelente! " + msg;
        fb.style.color = 'var(--success)';
        document.getElementById('btn-check').style.display = 'none';
        document.getElementById('btn-reset').style.display = 'none'; 
        document.getElementById('btn-next').style.display = 'block';
    },

    fail(msg) {
        let fb = document.getElementById('game-feedback');
        fb.innerHTML = "¡Ups! " + msg + " <br>¡Inténtalo!"; 
        fb.className = 'feedback shake-anim';
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
        let bot = document.getElementById('game-bot');
        document.querySelectorAll('.target .drag-item').forEach(el => {
            el.style.position = 'relative'; bot.appendChild(el);
        });
        document.querySelectorAll('.click-item').forEach(el => {
            el.style.transform = 'scale(1)'; el.classList.remove('destroyed');
        });
        if(gameState) gameState.destroyed = 0;
        // Si es cloner o grid, reiniciamos func por complejidad de nodos
        if(gameState && (gameState.cloned !== undefined || gameState.r !== undefined)) {
            currentInitFunc();
        }
        this.clear();
    }
};