import {LEVELS} from './levels.js';

const TILE_WIDTH = 128, TILE_HEIGHT = 128, MAX_SPEED = 300, VEL_REDUCTION = 0.90, BASE_SPEED = 400;
const BULLET_SPEED = 500;
const KEY_DOWN = {};

let HERO, LEVEL;
const BULLETS = [];
const SCREEN = document.querySelector('#screen');

class Bullet {
    constructor(x0, y0, dx, dy) {
        this.x=x0;
        this.y=y0;
        this.dx=dx;
        this.dy=dy;
        this.el = document.createElement('div');
        this.el.classList.add('bullet');
        this.fly(0);
    };

    fly(dt) {
        this.x += dt*this.dx;
        this.y += dt*this.dy;
        this.el.style.left = this.x +'px';
        this.el.style.top = this.y +'px';
    }

    destroy() {
        // this.el.parentElement.removeChild(this.el);
        this.el.remove();
    }
};

function createMapElement(level) {
    let floor = document.createElement('div');
    let ceil = document.createElement('div');

    // div.innerHTML = '<b>asdasd</b>'
    console.log(level);
    for(let y=0;y<level.length;y++)
        for(let x=0;x<level[y].length;x++) {
            let tile = document.createElement('div');

            let klass='', char = level[y][x];;
            if(char == 'x') {
                if(y+1 == level.length || level[y+1][x] != ' ')
                    klass='black'
                else {
                    klass='wall';
                }
                if(y > 0 && level[y-1][x] == ' ') {
                    let gzyms = document.createElement('div');
                    gzyms.classList.add('tile', 'tile-gzyms');
                    gzyms.style.left = (TILE_WIDTH * x) + 'px';
                    gzyms.style.top = (TILE_HEIGHT * (y-1)) + 'px';
                    ceil.appendChild(gzyms);
                }
            } else
            if(char == 'd')
                klass = 'door';
            else klass='floor';

            tile.classList.add('tile', `tile-${klass}`);

            tile.style.left = (TILE_WIDTH * x) + 'px';
            tile.style.top = (TILE_HEIGHT * y) + 'px';
            floor.appendChild(tile);
        }

    let screen = document.querySelector('#screen');
    floor.style.zIndex = -1;
    floor.style.position = ceil.style.position ='relative';
    ceil.style.zIndex = 200;
    screen.appendChild(floor);
    screen.appendChild(ceil);
    // return div;
}


window.onload = function() {
    LEVEL = LEVELS[0]
    createMapElement(LEVEL.level);
    // console.log(el);
    // document.querySelector('#screen').appendChild(el);
    HERO = {
        el: document.querySelector('#stalagmite'),
        acc: [0, 0],
        pos: LEVEL.start,
        vel: [0, 0],
    };
    requestAnimationFrame(render);
}

window.addEventListener('keypress', function(event) {
    let code = event.code;
    console.log('keydown:', code);
    KEY_DOWN[code] = true;
    // if(code == 'KeyD')HERO.acc[0] = 1.0;
    // if(code == 'KeyA')HERO.acc[0] = -1.0;
    // if(code == 'KeyW')HERO.acc[1] = -1.0;
    // if(code == 'KeyS')HERO.acc[1] = 1.0;
});

window.addEventListener('keyup', function(event) {
    let code = event.code;
    console.log('keyup:', code);
    KEY_DOWN[code] = false;
    // if(code == 'KeyD' || code == 'KeyA')HERO.acc[0] = 0;
    // if(code == 'KeyS' || code == 'KeyW')HERO.acc[1] = 0;
});

SCREEN.addEventListener('click', function() {
    
    let dx = -HERO.pos[0] + (event.pageX - SCREEN.offsetLeft);
    let dy = -(HERO.pos[1]-50) + (event.pageY - SCREEN.offsetTop);
    console.log('mousepress', event, dx, dy);

    let length = Math.hypot(dx, dy);
    let m = length / BULLET_SPEED;
    dx /= m; dy /= m;

    let b = new Bullet(HERO.pos[0], HERO.pos[1]-50, dx, dy);
    document.querySelector('#screen').appendChild(b.el);

    BULLETS.push(b);
});

function collide(x, y) {
    let tileX = Math.floor(x / TILE_WIDTH), tileY = Math.floor(y / TILE_HEIGHT);
    return !(tileY >= 0 && tileY < LEVEL.level.length && tileX >= 0 && 
        tileX < LEVEL.level[tileY].length && LEVEL.level[tileY][tileX] == ' ');
}

let last_timestamp = null;

function render(timestamp) {
    // Player movement
    let dt = last_timestamp ? (timestamp - last_timestamp)/1000 : 1/60;
    last_timestamp = timestamp;

    let accX = (KEY_DOWN['KeyA']?-1:0) + (KEY_DOWN['KeyD']?1:0);
    let accY = (KEY_DOWN['KeyW']?-1:0) + (KEY_DOWN['KeyS']?1:0);

    HERO.vel[0] += dt * BASE_SPEED * accX;
    HERO.vel[1] += dt * BASE_SPEED * accY;

    if(accX == 0)HERO.vel[0] *= VEL_REDUCTION;
    if(accY == 0)HERO.vel[1] *= VEL_REDUCTION;

    let speed = Math.hypot(HERO.vel[0], HERO.vel[1]);

    if(speed > MAX_SPEED) {
        let m = speed / MAX_SPEED;
        HERO.vel[0] /= m;
        HERO.vel[1] /= m;
    }

    let newX = HERO.pos[0] + dt * HERO.vel[0];
    let newY = HERO.pos[1] + dt * HERO.vel[1];

    if(collide(newX-50,newY) || collide(newX+50,newY))
        newX = HERO.pos[0];

    if(collide(newX,newY+5) || collide(newX, newY-20))
        newY = HERO.pos[1];

    if(!collide(newX-50,newY) && !collide(newX+50,newY) && !collide(newX,newY+5) && !collide(newX, newY-20)) {
        HERO.pos[0] = newX;
        HERO.pos[1] = newY;
    }

    HERO.el.style.left = HERO.pos[0] + 'px';
    HERO.el.style.top = HERO.pos[1] + 'px';

    // Bullets fly
    BULLETS.filter(bullet => {
        bullet.fly(dt);
        let c = collide(bullet.x, bullet.y);
        if(c)bullet.destroy();
        return !c
    })

    requestAnimationFrame(render);
}