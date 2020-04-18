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

function updateState() {
    if(p.collidedWith === undefined) p.state = 0;
    else {
	let dist;
	// distance between the side the player is sticking to and the side which sticks
	// should be near zero when sticking
	
	switch(p.state) {
	case 1:
	    dist = p.top() - p.collidedWith.bottom();
	    break;
	case 2:
	    dist = p.right() - p.collidedWith.left();
	    break;
	case 3:
	    dist = p.bottom() - p.collidedWith.top();
	    break;
	case 4:
	    dist = p.left() - p.collidedWith.right();
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
	       (!C.rangesOverlap(p.top(), p.bottom(), p.collidedWith.top(), p.collidedWith.bottom()))
	      ) { // so many parentheses but at least the code makes sense
		p.state = 0;
		p.collidedWith = undefined;
	    }
	    break;
	case 1:
	case 3:
	    if((Math.abs(dist) > 0.01)
	       ||
	       (!C.rangesOverlap(p.left(), p.right(), p.collidedWith.left(), p.collidedWith.right()))
	      ) {
		p.state = 0;
		p.collidedWith = undefined;
	    }
	    break;
	}
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

function doingControls(){
    p.lastState = p.state;
     
    updateState();
    
    p.landed = false; // these have to be set somewhere else to become true
    p.hitLeftWall = false;
    p.hitRightWall = false;
    p.hitCeiling = false;

    let inheritedXVel = 0;
    let inheritedYVel = 0;

    if(p.collidedWith !== undefined) {
	p.xVel = p.collidedWith.xVel;
	p.yVel = p.collidedWith.yVel;
	inheritedXVel = p.collidedWith.xVel;
	inheritedYVel = p.collidedWith.yVel;
    } // this might look dumb and idk there might be an easier way but this makes sense

    switch(p.state) {
    case 0:
	if(Math.abs(p.xVel) < jumpSpeed / 2) {
	    if(p.leftInput) {
		p.xVel -= speed / 8;
	    }
	    if(p.rightInput) {
		p.xVel += speed / 8;
	    }
	} // a little bit of aerial control
	break;

    case 3:
	if(p.leftInput) {
	    p.xVel = -speed + inheritedXVel;
	}
	if(p.rightInput) {
	    p.xVel = speed + inheritedXVel;
	}
	if(p.upInput) {
            p.yVel -= jumpSpeed;
	    if(p.leftInput) p.xVel -= jumpSpeed / 2;
	    if(p.rightInput) p.xVel += jumpSpeed / 2;
	    // jumps feel like crap if you don't give them extra velocity in both relevant directions
	    // so I add half the jumpspeed to the current speed
	}
	break;

    case 4:
	if(p.upInput) {
            p.yVel = -speed + inheritedYVel;
	}
	if(p.downInput) {
	    p.yVel = speed + inheritedYVel;
	}
	if(p.rightInput) {
	    p.xVel += jumpSpeed;
	    if(p.upInput) p.yVel -= jumpSpeed / 2;
	    if(p.downInput) p.yVel += jumpSpeed / 2;
	}	
	break;

    case 2:
	if(p.upInput) {
            p.yVel = -speed + inheritedYVel;
	}
	if(p.downInput) {
	    p.yVel = speed + inheritedYVel;
	}
	if(p.leftInput) {
	    p.xVel -= jumpSpeed;
	    if(p.upInput) p.yVel -= jumpSpeed / 2;
	    if(p.downInput) p.yVel += jumpSpeed / 2;
	}	
	break;

    case 1:
	if(p.downInput) {
            p.yVel += jumpSpeed;
	    if(p.leftInput) p.xVel -= jumpSpeed / 2;
	    if(p.rightInput) p.xVel += jumpSpeed / 2;
	}
	if(p.leftInput) {
	    p.xVel = -speed + inheritedXVel;
	}
	if(p.rightInput) {
	    p.xVel = speed + inheritedXVel;
	}	
	break;
    }

    dealWithGravity();
}

export default { frogControls, doingControls, };
