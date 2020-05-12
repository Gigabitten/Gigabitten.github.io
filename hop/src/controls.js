import F from "./frog.js";
import N from "./newton.js";
import C from "./collision.js";
import St from "./state.js";
import M from "./maps.js";

const speed = 8;
const jumpSpeed = 20;

let p = F.player;
// frogControls was written by Addie - it's almost all the code she wrote for hop before we decided
// to do our projects separately
let frogControls = function(event) {
    if(p.controls !== undefined && p.controls === true) {
	var key_state = event.type == "keydown";
	switch(event.keyCode) {
	case 65: //A Key
	case 37: //Left Key
            p.leftInput = key_state;
            break;
	    
	case 87: //W Key	
	case 38: //Up Key
	case 32: // spacebar
            p.upInput = key_state;
            break;
	    
	case 68: //D Key	
	case 39: //Right Key
            p.rightInput = key_state;
            break;

	case 83: // S Key
	case 40: // Down Key
	    p.downInput = key_state;
	    break;
	case 82: // R key
	    if(key_state) p.map();
	    break;
	case 27: // Esc Key
	    if(key_state) M.MM();
	}
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
    St.updateState();

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
