const Navigation = {
    screens: ['screen-main', 'screen-sub', 'screen-game', 'screen-result'],

    goTo(id) {
        // Ocultar TODAS las pantallas primero
        this.screens.forEach(s => {
            const el = document.getElementById(s);
            if (el) el.classList.remove('active');
        });

        // Mostrar solo la pantalla destino
        const target = document.getElementById(id);
        if (target) target.classList.add('active');

        // Botón volver
        const btnBack = document.getElementById('btn-back');
        if (btnBack) btnBack.style.display = id === 'screen-main' ? 'none' : 'block';

        // Scroll al tope al cambiar de pantalla
        window.scrollTo(0, 0);

        if (window.AppUX && typeof window.AppUX.setFocusMode === 'function') {
            window.AppUX.setFocusMode(id === 'screen-game');
        }
    },

    back() {
        const active = document.querySelector('.screen.active');
        if (!active) { this.goTo('screen-main'); return; }
        if (active.id === 'screen-game') this.goTo('screen-sub');
        else if (active.id === 'screen-result') this.goTo('screen-sub');
        else this.goTo('screen-main');
    },

    showMenu(op) {
        // Usar window.DB para asegurar que main.js ya lo cargó
        const d = window.DB?.[op];
        if (!d) { console.error('DB no listo aún para:', op); return; }

        document.getElementById('sub-title').innerText = d.title;
        document.getElementById('sub-title').className = d.color;

        const list = document.getElementById('sub-list');
        list.innerHTML = '';

        d.games.forEach(g => {
            const b = document.createElement('button');
            b.className = `btn-menu ${d.color}`;
            b.innerText = g.n;
            b.onclick = () => {
                currentInitFunc = g.f;
                if (window.AppUX && typeof window.AppUX.startBlock === 'function') {
                    window.AppUX.startBlock();
                }
                this.restartGame();
                this.goTo('screen-game');
            };
            list.appendChild(b);
        });

        this.goTo('screen-sub');
    },

    restartGame() {
        if (window.points >= 5) {
            this.goTo('screen-result');
            return;
        }
        Effects.clear();
        if (currentInitFunc) currentInitFunc();
    }
};

window.Navigation = Navigation;