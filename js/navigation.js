const Navigation = {
    screens: ['screen-main', 'screen-sub', 'screen-game'],

    goTo(id) {
        this.screens.forEach(s => document.getElementById(s).classList.remove('active'));
        document.getElementById(id).classList.add('active');
        document.getElementById('btn-back').style.display = id === 'screen-main' ? 'none' : 'block';
    },

    back() {
        let active = document.querySelector('.screen.active').id;
        if(active === 'screen-game') this.goTo('screen-sub'); 
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
            b.onclick = () => { currentInitFunc = g.f; this.restartGame(); this.goTo('screen-game'); };
            list.appendChild(b);
        });
        this.goTo('screen-sub');
    },

    restartGame() {
        Effects.clear();
        if(currentInitFunc) currentInitFunc();
    }
};