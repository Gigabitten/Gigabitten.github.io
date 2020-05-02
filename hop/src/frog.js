import N from "./newton.js";
import R from "./render.js";
import S from "./shapes.js";
import C from "./collision.js";

let frogify = function(obj) {
    obj.name = 1;
    obj.collision = 3;
    obj.state = 3;
    obj.lastState = 3;
    obj.respawn = false;
    
    obj.upInput = false;
    obj.leftInput = false;
    obj.rightInput = false;
    obj.downInput = false;
    
    obj.landed = true;
    obj.hitLeftWall = false;
    obj.hitRightWall = false;
    obj.hitCeiling = true;

    obj.xSpawn = 0;
    obj.ySpawn = 0;
    obj.respawn = function() {
	this.x = this.xSpawn;
	this.y = this.ySpawn;
	this.xVel = 0;
	this.yVel = 0;
    }

    obj.renderOffsetX = 0;
    obj.renderOffsetY = 0;

    obj.snaps = [];
    obj.facing = 2;
    obj.desiredFacing = 2;
    obj.desiredRelFacing = 2;
}

let player = new Object();

let makeFrog = function(obj) {
    S.rect(0, 0, 32, 24, obj);
    frogify(obj);
    R.pushOntoLayer(obj, 20);
    // the obj doesn't push - they get pushed only
    C.colliders.push(obj);
    N.mover(obj, 0, 0, 0, 0, 0, 0, N.basicMove);
    N.bodies.push(obj);
    obj.draw = R.playerDraw;
    obj.sprites[0] = R.genSprite("frog.bmp");
    obj.sprites.map((s) => s.anchor.set(0.5, 0.5));
    S.anchorAndAdd(obj);
}

export default { player, makeFrog, };

