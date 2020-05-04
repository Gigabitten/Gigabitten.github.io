import F from "./frog.js";
import N from "./newton.js";
import C from "./collision.js";

const speed = 8;
const jumpSpeed = 20;

let p = F.player;

let frogControls = function(event) {
    var key_state = event.type == "keydown";
    switch(event.keyCode) {
    case 65: //A Key
    case 37: //Left Key
        p.leftInput = key_state;
        break;
	
    case 87: //W Key	
    case 38: //Up Key
        p.upInput = key_state;
        break;
	
    case 68: //D Key	
    case 39: //Right Key
        p.rightInput = key_state;
        break;

    case 83: // S Key
    case 40: // Down Key
	p.downInput = key_state;
    }
}
// necessary because rotation changes the width and height

function rotateInputClockwise(c) {
    if(c === undefined) c = 1;
    let i;
    for(i = 0; i < c; i++) {
	[p.relUp,
	 p.relRight,
	 p.relDown,
	 p.relLeft] = [p.relLeft,
		       p.relUp,
		       p.relRight,
		       p.relDown,];
    }
}

function weirdInc(n, c) {
    if(c === undefined) c = 1;
    for(let i = 0; i < c; i++) {
	if(n < 4) n++;
	else n = 1;
    }
    return n;
}

function weirdDiff(a, b) {
    let i;
    if(a === 0) a = 3;
    if(b === 0) b = 3;
    for(i = 0; a != b; i++) {
	a = weirdInc(a);
    }
    return i;
}

function rotate() {
    let rotations = weirdDiff(p.lastState, p.state);
    for(let i = 0; i < rotations; i++) {
	let temp;
	temp = p.width;
	p.width = p.height;
	p.height = temp;
	p.sprites.map((x) => x.rotation += Math.PI / 2);
    }
}

function updateState() {    
    if(p.collidedWith === undefined) p.state = 0;
    else if(p.state !== 1 && p.state !== 2 && p.state !== 3 && p.state !== 4) {
	if(p.landed) {
	    p.state = 3;
	}
	if(p.hitLeftWall) {
	    p.state = 4;
	}
	if(p.hitRightWall) {
	    p.state = 2;
	}
	if(p.hitCeiling) {
	    p.state = 1;
	}
    }
    else if(p.state === 1 || p.state === 2 || p.state === 3 || p.state === 4) {
	let dist;
	let hit;
	
	// Should be near zero when sticking.
	switch(p.state) {
	case 1:
	    dist = p.top() - p.bottomHit.bottom();
	    hit = p.bottomHit;
	    break;
	case 2:
	    dist = p.right() - p.leftHit.left();
	    hit = p.leftHit;
	    break;
	case 3:
	    dist = p.bottom() - p.topHit.top();
	    hit = p.topHit;
	    break;
	case 4:
	    dist = p.left() - p.rightHit.right();
	    hit = p.rightHit;
	    break;
	}
	
	switch(p.state) {
	case 4:
	case 2:
	    // there can be small variation due to differences in rounding
	    // but if they ever accumulate to 0.01 something has gone horribly wrong
	    // also - making sure the player is still on the object
	    if((Math.abs(dist) > 0.01)
	       ||
	       (!C.rangesOverlap(p.top(), p.bottom(), hit.top(), hit.bottom()))
	      ) { // so many parentheses but at least the code makes sense
		p.state = 0;
		p.collidedWith = undefined;
	    }
	    break;
	case 1:
	case 3:
	    if((Math.abs(dist) > 0.01)
	       ||
	       (!C.rangesOverlap(p.left(), p.right(), hit.left(), hit.right()))
	      ) {
		p.state = 0;
		p.collidedWith = undefined;
	    }
	    break;
	}
    }
    rotate();

    p.snaps.map(x => x(p));
    
    switch(p.state) {
    case 2:
	p.renderOffsetX = -8;
	p.renderOffsetY = 0;
	break;
    case 4:
	p.renderOffsetX = 0;
	p.renderOffsetY = 0;
	break;
    case 1:
	p.renderOffsetX = 0;
	p.renderOffsetY = 0;
	break;
    case 3:
	p.renderOffsetX = 0;
	p.renderOffsetY = -8;
	break;
    }
    // Why these offsets? I honestly do not know. I used to know, then when I changed the tile size
    // to 32x32... something just broke and these numbers fixed it. No idea why this works.
    // These offsets were originally just here to deal with the wonkiness of player rotation.
    
    p.lastState = p.state;

    p.landed = false; // these have to be set somewhere else to become true
    p.hitLeftWall = false;
    p.hitRightWall = false;
    p.hitCeiling = false;
}

function dealWithGravity() {
    if(p.state !== 0) {
	p.physicsBehaviors = N.noGrav;
	if(p.state !== p.lastState) {
	    F.xVel = 0;
	    F.yVel = 0;
	}
    }
    else {
	p.physicsBehaviors = N.basicMove;
    }
}

function rotateInputs() {
    [p.relUp, p.relRight, p.relDown, p.relLeft] = [p.upInput, p.rightInput, p.downInput, p.leftInput];
    switch(p.state) {
    case 0:
	break;
    case 1:
	rotateInputClockwise(2);
	break;
    case 2:
	rotateInputClockwise(1);
	break;
    case 3:
	break;
    case 4:
	rotateInputClockwise(3);
	break;
    }
}

function moveRelative() {
    p.relXDisp = 0;
    p.relYDisp = 0;
    switch(p.state) {
    case 0:
	if(p.leftInput) p.desiredFacing = 4;
	if(p.rightInput) p.desiredFacing = 2;
	// there's actually no need to do relative motion here
	if(Math.abs(p.xVel) < jumpSpeed / 2) {
	    if(p.leftInput) {
		p.xVel -= speed / 8;
	    }
	    if(p.rightInput) {
		p.xVel += speed / 8;
	    }
	} // a little bit of aerial control
	break;

    case 1:
    case 2:
    case 3:
    case 4:
	if(p.relLeft) {
	    p.desiredFacing = 4;
	    p.relXDisp -= speed;
	}
	if(p.relRight) {
	    p.desiredFacing = 2;
	    p.relXDisp += speed;
	}
	if(p.relUp) {
            p.relYDisp += jumpSpeed;
	    if(p.relLeft) p.relXDisp -= jumpSpeed / 2;
	    if(p.relRight) p.relXDisp += jumpSpeed / 2;
	    // jumps feel like crap if you don't give them extra velocity in both relevant directions
	    // so I add half the jumpspeed to the current speed
	}
	break;
    }
}

function unrotate() {
    switch(p.state) {
    case 1:
	p.relXDisp = -p.relXDisp;
	p.relYDisp = -p.relYDisp;
    case 3:
	// jank, I know
	p.relYDisp = -p.relYDisp;
	p.xVel += p.relXDisp;
	p.yVel += p.relYDisp;
	break;
    case 2:
	p.relXDisp = -p.relXDisp;
	p.relYDisp = -p.relYDisp;
    case 4:
	p.yVel += p.relXDisp;
	p.xVel += p.relYDisp;
	break;
    }
}

/* Control handling ended up being a pretty complex mechanism. The first step is just to update the
 * state based on stuff informed by collision. Then the player inherits the x and y velocity of
 * whichever object it's sticking to, if any. Then the actual control handling comes in. Basically,
 * in order to not have a separate case for each rotation, the controls are rotated instead based on
 * the player's state. Then moveRelative() uses those rotated controls to set displacements for the
 * player, and unrotate() translates those displacements into velocities, again based on the state.
 *
 * Finally, dealWithGravity() is fairly self-explanatory. It just makes sure the player doesn't fall
 * down walls it's sticking to.
 */
function doingControls() {
    updateState();

    if(p.collidedWith !== undefined) {
	p.xVel = p.collidedWith.xVel;
	p.yVel = p.collidedWith.yVel;
    }

    rotateInputs();
    moveRelative();
    unrotate();

    dealWithGravity();

    p.snaps = [];
}

export default { frogControls, doingControls, };
