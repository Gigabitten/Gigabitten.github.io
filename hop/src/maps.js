import S from "./shapes.js"
import N from "./newton.js";
import F from "./frog.js";
import C from "./collision.js";
import R from "./render.js";

// Loading order actually determines rendering order. Load the things you want on top last.

let map1 = function() {
    R.viewport.minX = -30;
    R.viewport.minY = -30;
    R.viewport.maxX = 1030;
    R.viewport.maxY = 1030;

    S.killRect(900, 900, 50, 50);

    S.floor(-2000, 1000, 4998, 2000);
    S.ceiling(-2000, -2000, 5000, 2000);
    S.wall(-2000, 0, 2000, 1006, 4);
    S.wall(1000, 0, 2000, 1006, 2);

    S.checkpoint(468, 972);

    let m = new Object();
    let TLi = 0;
    let BRi = 1000;
    let s = 100;
    let gap = 40;
    let TL = TLi + gap;
    let BR = BRi - gap;
    let V = 10;
    S.dev(200, 200, s, s, m);
    m.physicsBehaviors = [function(obj) {
	if(obj.bottom() > BR) {
	    obj.y = BR - obj.height;
	    obj.yVel = 0;
	    obj.xVel = V;
	}
   	if(obj.right() > BR) {
	    obj.x = BR - obj.width;
	    obj.xVel = 0;
	    obj.yVel = -V;
	}
	if(obj.top() < TL) {
	    obj.y = TL;
	    obj.yVel = 0;
	    obj.xVel = -V;
	}
	if(obj.left() < TL) {
	    obj.x = TL;
	    obj.xVel = 0;
	    obj.yVel = V;
	}
    }, N.applyVel];
    N.bodies.push(m);
    m.xVel = -V;

    F.makeFrog(F.player);
    F.player.xSpawn = 500;
    F.player.ySpawn = 960;
    F.player.respawn();
}

export default { map1, };



