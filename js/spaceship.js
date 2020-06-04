'use strict'

var score = 0;
var difficulty = 6;
var points = null;
var emojis = null;
var txtSpeed = null;
var game = null;
var gameMode = null;
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
var keyX = 88;

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
    context.fillText('SPACESHIP GAME', 150, 45);
    context.fillText('Press Enter -> Normal Mode', 150, 75);
    context.fillText('Press X -> No ammo, dodge!', 150, 105);
};

menu.act = function() {
    if(lastPress === keyEnter) {
        loadScene(game);
        lastPress = null;
    }
    if(lastPress === keyX) {
        txtSpeed.setAttribute('style', 'display: inline');
        points[0].innerHTML = 'Normal';
        points[1].innerHTML = 'Fast';
        points[2].innerHTML = 'Faster';
        points[3].innerHTML = 'Super Fast';
        points[4].innerHTML = '!!!!!';
        loadScene(gameMode);
        lastPress = null;
    }
};

game = new scene();

game.load = function() {
    score = 0;
    difficulty = 6;
    ship = new Rectangle(145, 130, 16, 15);
    shots.length = 0;
    enemies.length = 0;
    enemies.push(new Rectangle((random(canvas.width / 10) * 10), 0 ,10,10));
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
                    while(enemies.length < difficulty) {
                        enemies.push(new Rectangle(random(canvas.width / 10) * 10, 0, 10, 10));
                    }
                    shots.splice(j--,1);
                    sl--;
                    //scoreboard
                    for(var i = 0; i < points.length; i++) {
                        if(score == points[i].innerHTML) {
                            points[i].setAttribute('style', 'display: none');
                            emojis[i].setAttribute('style', 'display: inline');
                            difficulty++;
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


gameMode = new scene();

gameMode.load = function() {
    score = 0;
    difficulty = 5;
    points[0].setAttribute('style', 'color: violet');
    for(var i = 1; i < points.length; i ++) {
        points[i].setAttribute('style', 'color: #ffffffb2');
    }
    ship = new Rectangle(145, 130, 16, 15);
    enemies.length = 0;
    enemies.push(new Rectangle((random(canvas.width / 10) * 10), 0 ,10,10));
    gameOver = false;
    pause = false;
}

gameMode.act = function() {
    if(!pause){
        //reset game
        if(gameOver) {
            gameMode.load();
        }
        //horizontal movement
        if(pressing[keyRight]) {ship.x += 10;}
        if(pressing[keyLeft]) {ship.x -= 10;}
        //canvas limits
        if(ship.x > canvas.width - ship.width) {ship.x = canvas.width - ship.width;}
        if(ship.x < 0) {ship.x = 0;}
        //enemies movement
        for(var i = 0; i < enemies.length; i++) {
            var speed = random(10);
            //change scoreboard & enemy speed depending on score
            if(score > 8) {
                speed = random(15);
                points[1].setAttribute('style', 'color: violet');
            }
            if(score > 25) {
                speed = random(18);
                points[2].setAttribute('style', 'color: violet');
            }
            if(score > 40) {
                speed = random(20);
                points[3].setAttribute('style', 'color: violet');
            }
            if(score > 55) {
                speed = random(25);
                points[4].setAttribute('style', 'color: violet');
            }
            if(score > 235) {
                speed = random(30);
                points[5].setAttribute('style', 'color: violet');
            }
            enemies[i].y += speed;
            if(enemies[i].y > canvas.height) {
                enemies[i].x = random(canvas.width / 10) * 10;
                enemies[i].y = 0;
                score++;
            }
            //player-enemy intersection
            if(ship.intersects(enemies[i])) {
                gameOver = true;
            }
            //enemy spawn
            while(enemies.length < difficulty) {
                enemies.push(new Rectangle(random(canvas.width / 10) * 10, 0, 10, 10));
            }
        }
    }
}

gameMode.paint = function(context) {
    context.fillStyle = '#201827';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.drawImage(shipImage, ship.x, ship.y);

    for(var i = 0; i < enemies.length; i++) {
        context.drawImage(enemyImage, enemies[i].x, enemies[i].y);
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
    txtSpeed = document.getElementById('speed');
    shipImage.src = 'assets/ship.png';
    shotImage.src = 'assets/shot.png';
    enemyImage.src = 'assets/enemy.png';
    run();
    repaint();
}