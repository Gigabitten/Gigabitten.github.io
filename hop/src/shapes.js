import R from "./render.js";
import N from "./newton.js";
import C from "./collision.js";
import U from "./utils.js";

let Graphics = PIXI.Graphics;

let rect = function(x, y, w, h, r) {
    r.name = 3;
    r.collision = 3;
    r.x = x;
    r.y = y;
    r.width = w;
    r.height = h;
    r.top = function() {
	return this.y;
    }
    r.right = function() {
	return this.x + this.width;
    }
    r.bottom = function() {
	return this.y + this.height;
    }
    r.left = function() {
	return this.x;
    }
    r.sprites = [];
}

let dev = function(x, y, w, h, r) {
    x *= 32;
    y *= 32;
    w *= 32;
    h *= 32;    
    if(r === undefined) r = new Object();
    collidableRect(x, y, w, h, r);
    r.name = 6;
    r.sprites[0] = R.genTile("img/Dev.png", w, h);
    r.draw = R.singleDraw;
    anchorAndAdd(r);
    return r;
}

let anchorAndAdd = function(r) {
    r.sprites.map((s) => {
	if(s.anchor !== undefined) {
	    s.anchor.set(0.5, 0.5);
	    R.app.stage.addChild(s);
	}
    });
}

let collidableRect = function(x, y, w, h, r, l) {
    if(r === undefined) r = new Object();
    rect(x, y, w, h, r);
    r.collisionHandler = C.wallHandler;
    C.colliders.push(r);
    if(l === undefined) l = 10;
    R.pushOntoLayer(r, l);
    N.mover(r);
    r.collision = 1;
}

let ceiling = function(x, y, w, h, r) {
    x *= 32;
    y *= 32;
    w *= 32;
    h *= 32;
    if(r === undefined) r = new Object();
    collidableRect(x, y, w, h, r);
    r.draw = R.ceilingDraw;
    r.type = 9;

    r.sprites[0] = R.genTile("img/Peat-Bare.png", w, h);
    anchorAndAdd(r);
}
// walls need an orientation - 2 for right internal walls, 4 for left
let wall = function(x, y, w, h, o, r) {
    x *= 32;
    y *= 32;
    w *= 32;
    h *= 32;
    if(r === undefined) r = new Object();
    collidableRect(x, y, w, h, r, 11);
    if(o === 2) {
	r.draw = R.rightWallDraw;
	r.name = 7;
    }
    else if(o === 4) {
	r.draw = R.leftWallDraw;
	r.name = 8;
    }
    else throw "Hey! Walls need an orientation.";
    r.sprites[0] = R.genSprite("img/Peat-Bare-Transition-Tree.png");
    r.sprites[1] = R.genSprite("img/Peat-Bare-Transition-Tree-Top.png");
    r.sprites[2] = R.genTile("img/Peat-Dead-Tree.png", 32, h - 64);
    r.sprites[3] = R.genTile("img/Peat-Dead.png", w - 32, h - 64);
    r.sprites[4] = R.genTile("img/Peat-Bare-Transition.png", w - 32, 32);
    r.sprites[5] = R.genTile("img/Peat-Bare-Transition.png", w - 32, 32);
    r.sprites[5].scale.y *= -1;
    if(o === 4) R.flipSprites(r, 'horizontal');
    anchorAndAdd(r);
}

let floor = function(x, y, w, h, r) {
    x *= 32;
    y *= 32;
    w *= 32;
    h *= 32;
    if(r === undefined) r = new Object();
    collidableRect(x, y, w, h, r);
    r.name = 6;
    r.sprites[0] = R.genTile("img/Peat.png", w, 32);
    r.sprites[1] = R.genTile("img/Peat-Bare.png", w, h - 32);
    r.draw = R.floorDraw;
    anchorAndAdd(r);
}

let killRect = function(x, y, w, h, r) {
    x *= 32;
    y *= 32;
    w *= 32;
    h *= 32;    
    if(r === undefined) r = new Object();
    dev(x, y, w, h, r);
    r.collisionHandler = C.killHandler;
    r.name = 4;
}

let checkpoint = function(x, y, f) {
    x *= 32;
    y *= 32;
    let w = 64;
    let h = 32;
    let r = new Object();
    collidableRect(x, y, w, h, r);
    r.name = 9;
    r.sprites[0] = R.genSprite("img/Lilypad.png", w, h);
    r.draw = R.singleDraw;
    r.collisionHandler = C.checkpointHandler;
    r.name = 4;
    r.check = f;
    anchorAndAdd(r);
}

let firefly = function(x, y, fx, fy, r) {
    let w = 8;
    let h = 8;
    if(r === undefined) r = new Object();
    collidableRect(x, y, w, h, r);
    r.name = 10;
    r.sprites[0] = R.genSprite("img/Firefly.png", w, h);
    r.draw = R.singleDraw;
    r.collisionHandler = C.checkpointHandler;
    r.baseX = x;
    r.baseY = y;
    r.counter = 0;
    N.bodies.push(r);
    r.physicsBehaviors = [function(obj) {
	obj.counter++;
	obj.x = fx === undefined ? ((obj) => obj.baseX) : fx(obj);
	obj.y = fy === undefined ? ((obj) => obj.baseY) : fy(obj);
    }];
    r.collisionHandler = C.fireflyHandler;
    r.destroy = function() {
	r.sprites[0].destroy();
	U.deleteObject(r);
    }
    anchorAndAdd(r);
}

let buildRoomBorder = function(w, h, t, c) {
    ceiling(-t, -t, 2*t+w, t, '#333333'); // top
    wall(-t, -t, t, 2*t+h, 4); // left
    floor(-t, h, 2*t+w, t); // bottom
    wall(w, -t, t, 2*t+h, 2); // right
}

let defaultStyle = new PIXI.TextStyle({
    fontFamily: "sans-serif",
    fontSize: 36,
    wordWrap: true,
    align: "center",
});

let text = function(m, x, y, w, tR) {
    x *= 32;
    y *= 32;
    w *= 32;
    if(tR === undefined) tR = new Object();
    rect(x, y, w, 100000, tR);
    tR.name = 0;
    
    let s = defaultStyle;
    let text = new PIXI.Text(m, s);
    text.style.wordWrapWidth = w;
    
    R.pushOntoLayer(tR, 18);
    tR.sprites[0] = text;
    tR.draw = R.singleDraw;
    anchorAndAdd(tR);
}

export default { rect, buildRoomBorder, killRect, checkpoint, floor, wall, ceiling, anchorAndAdd,
		 dev, firefly, text, };
