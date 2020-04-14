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
        p.left = key_state;
        break;
	
    case 87: //W Key	
    case 38: //Up Key
        p.up = key_state;
        break;
	
    case 68: //D Key	
    case 39: //Right Key
        p.right = key_state;
        break;

    case 83: // S Key
    case 40: // Down Key
	p.down = key_state;
    }
}

function updateState() {
    if(p.collidedWith === undefined) p.state = 0;
    else {
	switch(p.state) {
	case 4:
	case 2:
	    // there can be small variation due to differences in rounding
	    // but if they ever accumulate to 0.01 something has gone horribly wrong
	    if(Math.abs(p.lockedX - (p.x - p.collidedWith.x)) > 0.01) {
		p.state = 0;
	    }
	    // making sure the player is still on the object
	    if(!C.rangesOverlap(p.y,
				p.y + p.height,
				p.collidedWith.y,
				p.collidedWith.y + p.collidedWith.height)) {
		p.state = 0;
	    }
	    break;
	case 1:
	case 3:
	    if(Math.abs(p.lockedY - (p.y - p.collidedWith.y)) > 0.01) {
		p.state = 0;
	    }
	    if(!C.rangesOverlap(p.x,
				p.x + p.width,
				p.collidedWith.x,
				p.collidedWith.x + p.collidedWith.width)) {
		p.state = 0;
	    }
	    break;
	}
	if(p.landed) {
	    p.state = 3;
	    // a relative position, since everything is changing based on the player's position
	    p.lockedY = p.y - p.collidedWith.y;
	}
	if(p.hitLeftWall) {
	    p.state = 4;
	    p.lockedX = p.x - p.collidedWith.x;
	}
	if(p.hitRightWall) {
	    p.state = 2;
	    p.lockedX = p.x - p.collidedWith.x;
	}
	if(p.hitCeiling) {
	    p.state = 1;
	    p.lockedY = p.y - p.collidedWith.y;
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

    switch(p.state) {
    case 0:
	if(Math.abs(p.xVel) < jumpSpeed / 2) {
	    if(p.left) {
		p.xVel -= speed / 8;
	    }
	    if(p.right) {
		p.xVel += speed / 8;
	    }
	} // a little bit of aerial control
	break;

    case 3:
	if(p.left) {
	    p.xVel = -speed;
	}
	if(p.right) {
	    p.xVel = speed;
	}
	if(p.up) {
            p.yVel = -jumpSpeed;
	    if(p.left) p.xVel -= jumpSpeed / 2;
	    if(p.right) p.xVel += jumpSpeed / 2;
	    // jumps feel like crap if you don't give them extra velocity in both relevant directions
	    // so I add half the jumpspeed to the current speed
	}
	break;

    case 4:
	if(p.up) {
            p.yVel = -speed;
	}
	if(p.down) {
	    p.yVel = speed;
	}
	if(p.right) {
	    p.xVel = jumpSpeed;
	    if(p.up) p.yVel -= jumpSpeed / 2;
	    if(p.down) p.yVel += jumpSpeed / 2;
	}	
	break;

    case 2:
	if(p.up) {
            p.yVel = -speed;
	}
	if(p.down) {
	    p.yVel = speed;
	}
	if(p.left) {
	    p.xVel = -jumpSpeed;
	    if(p.up) p.yVel -= jumpSpeed / 2;
	    if(p.down) p.yVel += jumpSpeed / 2;
	}	
	break;

    case 1:
	if(p.down) {
            p.yVel = jumpSpeed;
	    if(p.left) p.xVel -= jumpSpeed / 2;
	    if(p.right) p.xVel += jumpSpeed / 2;
	}
	if(p.left) {
	    p.xVel = -speed;
	}
	if(p.right) {
	    p.xVel = speed;
	}	
	break;
    }

    dealWithGravity();
}

export default { frogControls, doingControls, };
