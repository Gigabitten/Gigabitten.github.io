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

    S.checkpoint(500, 1900, 100, 100, '#00ff00');
    S.checkpoint(1500, 1900, 100, 100, '#00ff00');
    
    S.floor(-2000, 1000, 4998, 2000);
    S.ceiling(-2000, -2000, 5000, 2000, '#333333');
    S.wall(-2000, 0, 2000, 1006, 4);
    S.wall(1000, 0, 2000, 1006, 2);

    F.makeFrog(F.player);
    F.player.xSpawn = 500;
    F.player.ySpawn = 960;
    F.player.respawn();
}

export default { map1, };

/* keeping this because I'll probably need it again
    let m = new Object();
    S.killRect(200, 200, 150, 150, '#00ffcc', m);
    let TL = 50;
    let BR = 1800
    m.physicsBehaviors = [function(obj) {
	if(obj.y > BR) {
	    obj.y = BR;
	    obj.yVel = 0;
	    obj.xVel = 20;
	}
	if(obj.x > BR) {
	    obj.x = BR;
	    obj.xVel = 0;
	    obj.yVel = -20;
	}
	if(obj.y < TL) {
	    obj.y = TL;
	    obj.yVel = 0;
	    obj.xVel = -20;
	}
	if(obj.x < TL) {
	    obj.x = TL;
	    obj.xVel = 0;
	    obj.yVel = 20;
	}
    }, N.applyVel];
    N.bodies.push(m);
    m.xVel = -20;
*/
