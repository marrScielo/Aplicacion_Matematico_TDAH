const Navigation = { // En el index.html
    screens: ['screen-main', 'screen-sub', 'screen-game', 'screen-result'],

    goTo(id) {
        this.screens.forEach(s => document.getElementById(s).classList.remove('active'));
        document.getElementById(id).classList.add('active');
        document.getElementById('btn-back').style.display = id === 'screen-main' ? 'none' : 'block';

        if (window.AppUX && typeof window.AppUX.setFocusMode === 'function') {
            window.AppUX.setFocusMode(id === 'screen-game');
        }
    },

    back() {
        let active = document.querySelector('.screen.active').id;
        if(active === 'screen-game') this.goTo('screen-sub'); 
        else if(active === 'screen-result') this.goTo('screen-sub');
        else this.goTo('screen-main');
    },

    showMenu(op) {
        let d = DB[op];
        document.getElementById('sub-title').innerText = d.title;
        document.getElementById('sub-title').className = d.color;
        let list = document.getElementById('sub-list'); list.innerHTML = '';
        d.games.forEach(g => {
            let b = document.createElement('button'); b.className = `btn-menu ${d.color}`;
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
    
        let progreso = 0;
        if (window.points >= 5) {
        this.goTo('screen-result');
        return; 
    }


        Effects.clear();
        if(currentInitFunc) currentInitFunc();
    }
};
// Al final de js/navigation.js
window.Navigation = Navigation;
