let colliders = [];

function isInRange(p, s, e) { // start, end, point
    return Math.min(s, e) <= p && Math.max(s, e) >= p;
}

function rangesOverlap(aS, aE, bS, bE) { // a start, a end, b start, b end
    // a can be to the left or to the right of b, so...
    if(aS < bS) { // if a starts before b
	return aE > bS; // true if a ends before b begins
    } else { // if a starts at or after b
	return bE > aS; // true if b ends before a begins
    }
}

let isPointInRect = function(r, x, y) {
    return isInRange(x, r.left(), r.right())
	&& isInRange(y, r.top(), r.bottom());
}

let isRectInRect = function(r1, r2) {
    return (rangesOverlap(r1.x, r1.x + r1.width, r2.x, r2.x + r2.width)
	    && rangesOverlap(r1.y, r1.y + r1.height, r2.y, r2.y + r2.height));
}

let collide = function(r1, r2) {
    let first = 0;
    let second = 0;
    let h1 = r1.collisionHandler;
    let h2 = r2.collisionHandler;
    if(h1 !== undefined) first = h1(r1, r2);
    if(h2 !== undefined) second = h2(r2, r1);
    /* this logic is kind of a disaster. basically, if either first or second isn't none, that means
     * that a collision happened, so now it checks to see if either r1 or r2 is a frog. If so, it
     * still has to check if the frog landed on top, but it has to check both from the perspective
     * of the surface and of the frog since only one collision actually occurs but the order is
     * arbitrary. It's a bit of a mess and I'm not really even sure how it could have been better.
     * Then I extended it later and the same idea holds so I really don't care to update this text.
     */
    if((first !== undefined || second !== undefined) && (first !== 0 || second !== 0)) {
	if(r1.name === 1) {
	    switch(second) {
	    case 1:
		r1.landed = true;
		break;
	    case 2:
		r1.hitLeftWall = true;
		break;
	    case 3:
		r1.hitCeiling = true;
		break;
	    case 4:
		r1.hitRightWall = true;
		break;
	    }
	}
	if(r2.name === 1) {
	    switch(first) {
	    case 1:
		r2.landed = true;
		break;
	    case 2:
		r2.hitLeftWall = true;
		break;
	    case 3:
		r2.hitCeiling = true;
		break;
	    case 4:
		r2.hitRightWall = true;
		break;
	    }
	}
    }		
}

let wallHandler = function(r1, r2) {
    if(r2.type !== 2) {
	return pushOutHandler(r1, r2);
    }
}

// remember - the second object in the collision function does the moving. an arbitrary decision, but
// it helps make it possible to think of collision as one object pushing another out of it
let pushOutHandler = function(r1, r2) {
    let side = 0;
    if(r2.collision === 3) {
	if(isRectInRect(r1, r2)) {
	    r2.collidedWith = r1;
	    r2.xVel = r1.xVel;
	    r2.yVel = r1.yVel;
	    
	    let left = Math.abs((r2.x + r2.width) - r1.x);
	    let right = Math.abs((r1.x + r1.width) - r2.x);
	    let top = Math.abs((r2.y + r2.height) - r1.y);
	    let bottom = Math.abs((r1.y + r1.height) - r2.y);
	    let snapDirection = Math.min(left, right, top, bottom);
	    if((snapDirection === left || snapDirection === right)
	       && Math.abs(Math.min(left, right) - top) < 10) {
		snapDirection = top;
	    } // makes sure that if something is close to clipping to the top, it does
	    switch(snapDirection) {
	    case left:
		if(r2.lastX > r1.x + r1.width) snapDirection = right;
		break;
	    case right:
		if(r2.lastX + r2.width < r1.x) snapDirection = left;
		break;
	    case top:
		if(r2.lastY > r1.y + r1.height) snapDirection = bottom;
		break;
	    case bottom:
		if(r2.lastY + r2.height < r1.y) snapDirection = top;
		break;
	    }
	    
	    switch(snapDirection) {
	    case left:
		r2.leftHit = r1;
		let leftSnap = function(obj) {
		    obj.x = obj.leftHit.x - obj.width;
		}
		r2.snaps.push(leftSnap);
		r2.snaps.map(x => x(r2));
		side = 4;
		break;

	    case right:
		r2.rightHit = r1;
		let rightSnap = function(obj) {
		    obj.x = obj.rightHit.x + obj.rightHit.width;
		}
		r2.snaps.push(rightSnap);
		r2.snaps.map(x => x(r2));
		side = 2;
		break;
		
	    case top:
		r2.topHit = r1;
		let topSnap = function(obj) {
		    obj.y = obj.topHit.y - obj.height;
		}
		r2.snaps.push(topSnap);
		r2.snaps.map(x => x(r2));
		side = 1;
		break;

	    case bottom:
		r2.bottomHit = r1;
		let bottomSnap = function(obj) {
		    obj.y = obj.bottomHit.y + obj.bottomHit.height;
		}
		r2.snaps.push(bottomSnap);
		r2.snaps.map(x => x(r2));
		side = 3;
		break;
	    }
	} 
    }
    return side;
}

let pAndR = function(r1, r2) {
    let p = r1.name === 1 ? r1 : r2
    let r = r1.name !== 1 ? r1 : r2
    return [p,r];
}

let killHandler = function(r1, r2) {
    let [p,r] = pAndR(r1, r2);
    if(p.name === 1 && isRectInRect(p, r)) {
	p.respawn();
    }
}

let checkpointHandler = function(r1, r2) {
    let [p,r] = pAndR(r1, r2);
    if(p.name === 1 && isRectInRect(p, r)) {
	r.check(p);
    }
}

let colorHandler = function(r1, r2) {
    if(r2.name === 3) {
	if(isRectInRect(r1, r2)) {
	    r1.color = '#006600';
	    r2.color = '#006600';
	} else {
	    r1.color = '#ff0000';
	    r2.color = '#ff0000';
	}
    }
}

let fireflyHandler = function(r1, r2) {
    if(isRectInRect(r1, r2)) {
	if(r2.name === 10 && r1.name === 1) {
	    r2.destroy();
	    r1.score++;
	}
	if(r1.name === 10 && r2.name === 1) {
	    r1.destroy();
	    r2.score++;
	}
    }
}

let doCollisions = function() {
    let i;
    let j;
    /* this nested loop might seem like magic and it kinda is but basically this covers
     * every combination of two elements in colliders without repeats and self-collision
     * so for [1,2,3] it would check 1 against 2, 1 against 3, and 2 against 3.
     */
    for(i = 0; i < colliders.length - 1; i++) {
	for(j = i + 1; j < colliders.length; j++) {
	    collide(colliders[i], colliders[j]);
	}
    }
}

let clear = function() {
    colliders.length = 0;
}

export default { colliders, doCollisions, pushOutHandler, colorHandler, wallHandler, isInRange,
		 rangesOverlap, isRectInRect, killHandler, checkpointHandler, fireflyHandler,
		 clear, isPointInRect, };
