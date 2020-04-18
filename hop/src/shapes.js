import R from "./render.js";
import N from "./newton.js";
import C from "./collision.js";

let rect = function(obj, topLeftX, topLeftY, width, height, hexColorCode) {
    obj.name = 3; // string comparison is slow but this is so much clearer than numerical ID's
    obj.collision = 3;
    obj.x = topLeftX;
    obj.y = topLeftY;
    obj.width = width;
    obj.height = height;
    obj.color = hexColorCode;
    obj.draw = R.rectDraw;
    N.mover(obj);
    obj.top = function() {
	return this.y;
    }
    obj.right = function() {
	return this.x + this.width;
    }
    obj.bottom = function() {
	return this.y + this.height;
    }
    obj.left = function() {
	return this.x;
    }

}

let buildWall = function(x, y, w, h, c, wall) {
    if(wall === undefined) wall = new Object();
    rect(wall, x, y, w, h, c);
    wall.collisionHandler = C.wallHandler;
    R.pushOntoLayer(wall, 10);
    C.colliders.push(wall);
    wall.type = 2;
}

let buildRoomBorder = function(w, h, t, c) {
    buildWall(-t, -t, 2*t+w, t, c); // top
    buildWall(-t, -t, t, 2*t+h, c); // left
    buildWall(-t, h, 2*t+w, t, c); // bottom
    buildWall(w, -t, t, 2*t+h, c); // right
}

export default { rect, buildWall, buildRoomBorder, };
