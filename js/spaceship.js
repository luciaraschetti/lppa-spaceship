'use strict'

var game = null;
var menu = null;
var currentScene = 0;
var scenes = [];
var canvas = null;
var context = null;
var pressing = [];
var lastPress = null;
var ship = null;
var shipImage = new Image();
var shots = [];
var shotImage = new Image();
var keyLeft = 37;
var keyUp = 38;
var keyRight = 39;
var keyDown = 40;
var keyEnter = 13;
var keySpace = 32;

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
}

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
    context.fillText('Press Enter', 150, 90);
};

menu.act = function() {
    if(lastPress === keyEnter) {
        loadScene(game);
        lastPress = null;
    }
};

game = new scene();

game.act = function() {
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
}

game.paint = function(context) {
    context.fillStyle = '#201827';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.drawImage(shipImage, ship.x, ship.y);

    for(var i = 0; i < shots.length; i++) {
        context.drawImage(shotImage, shots[i].x, shots[i].y);
    }
}

window.onload = function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    ship = new Rectangle(145, 130, 16, 15);
    shipImage.src = 'assets/ship.png';
    shotImage.src = 'assets/shot.png';
    run();
    repaint();
}