import N from "./src/newton.js";
import R from "./src/render.js";
import C from "./src/collision.js";
import U from "./src/utils.js";
import F from "./src/frog.js";
import SC from "./src/screenControl.js";
import Con from "./src/controls.js";
import M from "./src/maps.js";

let trackFrameTime = false;

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

let last = 0;
function getDiff(s) {
    if(frameCount > 10 && frameCount < 20 && trackFrameTime) {
	console.log(s);
	let tn = performance.now();
	console.log(tn - last);
	last = tn;
    }
}

let gameLoop = function() {
    let t = performance.now();
    if(frameCount * timeStep < t - t0) {
	if(frameCount % 60 === 0) {
	    possibleTimingError(t);
	    //	    SC.updateView();
	    // doesn't work with all browsers
	}
	/* the order of these steps can be important
	 * physics has to happen between collisions and doingControls
	 * otherwise doingControls resets temp physics handlers
	 */
	getDiff("Time to go from bottom to top:");
	frameCount++;
	
	N.doPhysics();
	getDiff("Time to do physics:");
	
	C.doCollisions();
	getDiff("Time to do collision:");
	
	Con.doingControls();
	getDiff("Time to do controls:");
	
	SC.scroll();
	getDiff("Time to scroll:");
	
	R.redraw();
	getDiff("Time to redraw:");
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
