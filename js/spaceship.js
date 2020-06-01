'use strict'

var game = null;
var menu = null;
var currentScene = 0;
var scenes = [];
var canvas = null;
var context = null;
var pressing = [];

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

window.onload = function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    run();
    repaint();
}