import R from "./render.js";

const fG = 1.5; // force of gravity
const cGF = 0.8; // ground friction
const cAF = 0.97; // aerial friction
const tV = 50;
// has to be between 0 and 1, preferably close to 1

let bodies = [];

function extendsBody(obj) {
    obj.xVel = 0;
    obj.yVel = 0;
    obj.xAcc = 0;
    obj.yAcc = 0;
    
    obj.physicsBehaviors = [];
}

/* Bodies are objects which can move. Their default position is offscreen, far to the bottom right,
 * assuming you don't, for some awful reason, make a mover bigger than the screen.
 * Technically, a mover can not have velocity or acceleration and never move. Whatever.
 */
let mover = function(obj, x, y, xVel, yVel, xAcc, yAcc, physicsBehaviors) {
    extendsBody(obj);
    if(x !== undefined) obj.x = x;
    if(y !== undefined) obj.y = y;	
    if(xVel !== undefined) obj.xVel = xVel;	
    if(yVel !== undefined) obj.yVel = yVel;
    if(xAcc !== undefined) obj.xAcc = xAcc;	
    if(yAcc !== undefined) obj.yAcc = yAcc;
    if(physicsBehaviors !== undefined && physicsBehaviors[0] !== undefined) {
	obj.physicsBehaviors = physicsBehaviors;
    } 
    
}

let storeLast = function(obj) {
    obj.lastX = obj.x;
    obj.lastY = obj.y;
}

let applyVel = function(obj) {
    storeLast(obj);
    obj.x += obj.xVel;
    obj.y += obj.yVel;
} // pretty straightforward

let aerialFriction = function(obj) {
    obj.xVel *= cAF;
    obj.yVel *= cAF;
}

let groundedFriction = function(obj) {
    obj.xVel *= cGF;
    obj.yVel *= cGF;
}

let projectileMotion = function(obj) {
    if(obj.yVel <= tV) obj.yVel += fG;
}

let basicMove = [
    applyVel,
    projectileMotion,
    aerialFriction,
];

let noGrav = [
    applyVel,
    groundedFriction,
];

let doPhysics = function() {
    bodies.forEach(x => {
	if(x.physicsBehaviors !== undefined) {
	    x.physicsBehaviors.map((doStep, index) => {
		let returnVal = doStep(x); // mutates x
		if(returnVal === -1) x.physicsBehaviors.splice(index,1);
	    });
	}
    });
}

let clear = function() {
    // for some reason this is equivalent to clearing the array and is even implementation-independent
    // so I'll use it since bodies = [] changes the reference
    bodies.length = 0;
}

export default { bodies, doPhysics, mover, basicMove, noGrav, tV, applyVel, clear,
	       };
