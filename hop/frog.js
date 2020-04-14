import N from "./newton.js";
import R from "./render.js";
import S from "./shapes.js";
import C from "./collision.js";

let makeFrog = function(obj) {
    obj.name = 1;
    obj.collision = 3;
    obj.state = 3;
    obj.up = false;
    obj.left = false;
    obj.right = false;
    obj.down = false;
    obj.landed = false;
    obj.hitWall = true;
    obj.hitCeiling = true;
    obj.lastState = 3;
    // indicates whether it landed on anything this frame
}

let player = new Object();
S.rect(player, 0, 0, 20, 20, '#003300');
makeFrog(player);
R.pushOntoLayer(player, 20);
player.collisionHandler = undefined;
// the player doesn't push - they get pushed only
C.colliders.push(player);
N.mover(player, 150, 150, 0, 0, 0, 0, N.basicMove);
N.bodies.push(player);

export default { player, };
