import N from "./src/newton.js";
import R from "./src/render.js";
import C from "./src/collision.js";
import U from "./src/utils.js";
import F from "./src/frog.js";
import SC from "./src/screenControl.js";
import Con from "./src/controls.js";
import M from "./src/maps.js";

const gameSpeed = 60;
const timeStep = 1000 / gameSpeed; // 16.666...
let t0 = performance.now();
let frameCount = 0;

let tt = 0; // time tracker

function possibleTimingError(t) {
    if(frameCount / 60 > 1) {
	if(Math.abs((t - tt) - 1000) > 20) {
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
	/* the order of these steps can be important
	 * physics has to happen between collisions and doingControls
	 * otherwise doingControls resets temp physics handlers
	 */
	frameCount++;
	N.doPhysics();
	C.doCollisions();
	Con.doingControls();
	SC.scroll();
	R.redraw();
    }
    window.requestAnimationFrame(gameLoop);
}
window.addEventListener("keydown", Con.frogControls);
window.addEventListener("keyup", Con.frogControls);

let singulars = [0,7];

let init = function() {
    M.map1();
    window.requestAnimationFrame(gameLoop);
}

PIXI.loader
    .add('img/spritesheet.json')
    .load(init);
