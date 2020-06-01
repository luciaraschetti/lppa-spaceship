'use strict'

var score = 0;
var points = null;
var emojis = null;
var game = null;
var menu = null;
var currentScene = 0;
var scenes = [];
var canvas = null;
var context = null;
var pause = true;
var gameOver = true;
var pressing = [];
var lastPress = null;
var ship = null;
var shipImage = new Image();
var shots = [];
var shotImage = new Image();
var enemyImage = new Image();
var enemies = [];
var keyLeft = 37;
var keyUp = 38;
var keyRight = 39;
var keyDown = 40;
var keyEnter = 13;
var keySpace = 32;

var random = function(max) {
    return ~~(Math.random() * max);
}
    
var Rectangle = function(x, y, width, height) { //rectangle obj 
    this.x = (x === undefined) ? 0 : x;
    this.y = (y === undefined) ? 0 : y;
    this.width = (width === undefined) ? 0 : width;
    this.height = (height === undefined) ? this.width : height;

    this.fill = function(context) {
        if(context === undefined) {
            window.console.warn('Missing parameters on function fill');
        } else {
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    this.intersects = function(rect) {
        if(rect === undefined) {
            window.console.warn('Missing parameters on function intersects');
        } else {
            return(this.x < rect.x + rect.width &&
                this.x + this.width > rect.x &&
                this.y < rect.y + rect.height &&
                this.y + this.height > rect.y);
        }
    }
}

//browser compatibility
window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 17);
    }
}());

document.addEventListener('keydown', function(evt) {
    lastPress = evt.keyCode;
    pressing[evt.keyCode] = true;
}, false);

document.addEventListener('keyup', function(evt) {
    pressing[evt.keyCode] = false;
}, false);

var scene = function() {
    this.id = scenes.length;
    scenes.push(this);
}

scene.prototype = {
    constructor: scene,
    load: function() {},
    paint: function(context) {},
    act: function() {}
};

var loadScene = function(scene) {
    currentScene = scene.id;
    scenes[currentScene].load();
}

var repaint = function() {
    window.requestAnimationFrame(repaint);
    if(scenes.length) {
        scenes[currentScene].paint(context);
    }
}

var run = function() {
    setTimeout(run, 50);
    if(scenes.length) {
        scenes[currentScene].act();
    }
}

menu = new scene();

menu.paint = function(context) {
    context.fillStyle = '#201827';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = '#ff0080a1';
    context.textAlign = 'center';
    context.fillText('SPACESHIP GAME', 150, 60);
    context.fillText('Use space & arrow keys to play', 150, 90);
    context.fillText('Press Enter', 150, 120);
};

menu.act = function() {
    if(lastPress === keyEnter) {
        loadScene(game);
        lastPress = null;
    }
};

game = new scene();

game.load = function() {
    score = 0;
    ship = new Rectangle(145, 130, 16, 15);
    shots.length = 0;
    enemies.length = 0;
    enemies.push(new Rectangle(10,0,10,10));
    pause = true;
    gameOver = false;
}

game.act = function() {
    //pause
    if(lastPress === keyEnter) {
        pause =! pause;
        lastPress = null;
    }
    if(!pause){
        //reset game
        if(gameOver) {game.load();}
        //horizontal movement
        if(pressing[keyRight]) {ship.x += 10;}
        if(pressing[keyLeft]) {ship.x -= 10;}
        //canvas limits
        if(ship.x > canvas.width - ship.width) {ship.x = canvas.width - ship.width;}
        if(ship.x < 0) {ship.x = 0;}
        //space -> adds new 'shot' to array
        if(lastPress === keySpace) {
            shots.push(new Rectangle(ship.x + 3, ship.y, 5, 5));
            lastPress = null;
        }
        //shots movement & removal when hitting the top of the canvas
        for(var i = 0, l = shots.length; i < l; i++) {
            shots[i].y -= 10;
            if(shots[i].y < 0) {
                shots.splice(i--, 1);
                l--;
            }
        }
        //enemies movement
        for(var i = 0; i < enemies.length; i++) {
            enemies[i].y += 3;
            if(enemies[i].y > canvas.height) {
                enemies[i].x = random(canvas.width / 10) * 10;
                enemies[i].y = 0;
            }
            //player-enemy intersection
            if(ship.intersects(enemies[i])) {
                gameOver = true;
                pause = true;
            }
            //shot-enemy intersection
            for(var j = 0, sl = shots.length; j < sl; j++) {
                if(shots[j].intersects(enemies[i])) {
                    score++;
                    enemies[i].x = random(canvas.width / 10) * 10;
                    enemies[i].y = 0;
                    enemies.push(new Rectangle(random(canvas.width / 10) * 10, 0, 10, 10));
                    shots.splice(j--,1);
                    sl--;
                    //scoreboard
                    for(var i = 0; i < points.length; i++) {
                        if(score == points[i].innerHTML) {
                            points[i].setAttribute('style', 'display: none');
                            emojis[i].setAttribute('style', 'display: inline');
                        }
                    }
                }
            }
        }
    }
}

game.paint = function(context) {
    context.fillStyle = '#201827';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.drawImage(shipImage, ship.x, ship.y);

    for(var i = 0; i < enemies.length; i++) {
        context.drawImage(enemyImage, enemies[i].x, enemies[i].y);
    }

    for(var i = 0; i < shots.length; i++) {
        context.drawImage(shotImage, shots[i].x, shots[i].y);
    }

    context.fillStyle = '#ff0080a1';
    context.textAlign = 'left';
    context.fillText('Score : ' + score, 5, 20);

    if(pause) {
        context.textAlign = 'center';
        if(gameOver) {
            context.fillText('Game Over', 150, 75);
        } else {
            context.fillText('Pause', 150, 20);
        }
    }
}

window.onload = function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    points = document.getElementsByClassName('points');
    emojis = document.getElementsByClassName('emoji');
    shipImage.src = 'assets/ship.png';
    shotImage.src = 'assets/shot.png';
    enemyImage.src = 'assets/enemy.png';
    run();
    repaint();
}