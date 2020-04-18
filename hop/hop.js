import N from "./src/newton.js";
import R from "./src/render.js";
import C from "./src/collision.js";
import S from "./src/shapes.js";
import U from "./src/utils.js";
import F from "./src/frog.js";
import SC from "./src/screenControl.js";
import Con from "./src/controls.js";

const gameSpeed = 60;
const timeStep = 1000 / gameSpeed; // 16.666...
let t0 = performance.now();
let frameCount = 0;

//S.buildWall(200, 450, 80, 200, '#ff0000');
//S.buildWall(250, 700, 400, 30, '#cc33ff');
//S.buildWall(620, 700, 30, 250, '#cc33ff');

S.buildRoomBorder(2000, 2000, 1000, '#333333');

let m = new Object();
S.buildWall(200, 200, 150, 150, '#33ff00', m);
m.physicsBehaviors = [function(obj) {
    if(obj.y > 1800) {
	obj.y = 1800;
	obj.yVel = 0;
	obj.xVel = 20;
    }
    if(obj.x > 1800) {
	obj.x = 1800;
	obj.xVel = 0;
	obj.yVel = -20;
    }
    if(obj.y < 200) {
	obj.y = 200;
	obj.yVel = 0;
	obj.xVel = -20;
    }
    if(obj.x < 200) {
	obj.x = 200;
	obj.xVel = 0;
	obj.yVel = 20;
    }
}, N.applyVel];
N.bodies.push(m);
m.xVel = -20;

let tt = 0; // time tracker

function possibleTimingError(t) {
    if(frameCount / 60 > 1) {
	if(Math.abs((t - tt) - 1000) > 10) {
	    console.log("The last 60 frames were significantly off from a second!"
			+ `\nTook ${t - tt} ms.`);
	}
	tt = t;
    }
}

let gameLoop = function() {
    let t = performance.now();
    if(frameCount * timeStep < t - t0) {
	if(frameCount % 60 === 0) {
	    possibleTimingError(t);
	    SC.updateView();
	}
	
	frameCount++;
	N.doPhysics();
	C.doCollisions();
	Con.doingControls();
	SC.scroll();
	R.redraw();
    }
    window.requestAnimationFrame(gameLoop);
}
// TODO: add visibility/collidability manager to game loop
window.addEventListener("keydown", Con.frogControls);
window.addEventListener("keyup", Con.frogControls);

F.spawnPlayer(1000, 700);
window.requestAnimationFrame(gameLoop);
