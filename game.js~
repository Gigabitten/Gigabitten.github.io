// TODO: Viewport doesn't match, erm, well... the actual viewport on the page.
import N from "./src/newton.js";
import R from "./src/render.js";
import C from "./src/collision.js";
import U from "./src/utils.js";
import F from "./src/frog.js";
import SC from "./src/screenControl.js";
import Con from "./src/controls.js";
import M from "./src/maps.js";
import Cl from "./src/clicks.js";

let trackFrameTime = false;

const gameSpeed = 60;
const timeStep = 1000 / gameSpeed; // 16.666...
let t0 = performance.now();
let frameCount = 0;
let frameTime = 1000/60;
let accumDiff = 0;

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
    let diff;
    let tn = performance.now();
    diff = tn - last;
    last = tn;
    if(frameCount > 110 && frameCount < 120 && trackFrameTime) {
	console.log(s);
	console.log(diff);
    }
    return diff;
}

let gameLoop = function(delta) {
    let t = performance.now();
    if(frameCount % 60 === 0) {
	possibleTimingError(t);
	//	    SC.updateView();
	// doesn't work with all browsers
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
window.addEventListener("keydown", Con.frogControls);
window.addEventListener("keyup", Con.frogControls);
window.addEventListener("click", Cl.clickHandler);

let init = function() {
    M.MM();
    R.app.ticker.add(delta => gameLoop(delta));
}

PIXI.loader
    .add('img/Dev.png')
    .add('img/Frog.png')
    .add('img/Lilypad.png')
    .add('img/Peat-Bare.png')
    .add('img/Peat-Bare-Transition.png')
    .add('img/Peat-Bare-Transition-Tree.png')
    .add('img/Peat-Bare-Transition-Tree-Top.png')
    .add('img/Peat-Dead.png')
    .add('img/Peat-Dead-Tree.png')
    .add('img/Peat.png')
    .add('img/Firefly.png')
    .load(init);



