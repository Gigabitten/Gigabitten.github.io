import F from "./frog.js";
import N from "./newton.js";
import C from "./collision.js";

let p = F.player;
let gameState = 0;
// Exports are immutable to the thing importing them, so this is necessary, although annoying.
function setGameState(n) {
    gameState = n;
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
    if(p.collidedWith === undefined) {
	p.state = 0;
    }
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

export default { updateState, gameState, };
