import C from "./collision.js";
/* If anything seems redundant regarding visibility management, that's because I switched from
 * vanilla canvas bindings to pixi when it turned out that tiling textures is awful without some
 * sort of library to help.
 * 
 * Drawing is the same. Drawing used to do a bunch of canvas stuff and then pixi made rendering cake
 * so all I have to do is update sprite positions relative to the object.
 */
let canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let app = new PIXI.Application({width: canvas.width,
				height: canvas.height,
				backgroundColor: 0x009933,
				view: canvas,
			   });
document.body.appendChild(app.view);
let stage = app.stage;
const zoom = 2;
stage.scale.x = zoom;
stage.scale.y = zoom;

// pixi aliases
let tm = function(s) {
    return PIXI.loader.resources[s].texture;
}
// can't evaluate right away since obviously img/spritesheet.json hasn't loaded yet.
// a function is a great method of delaying execution to the call for something
let Application = PIXI.Application;
let loader = PIXI.loader;
let resources = PIXI.loader.resources;
let Sprite = PIXI.Sprite;

let visibles = [];

let xOffsetDelta = { xO: 0 };
let yOffsetDelta = { yO: 0 };

let viewport = {
    x: 0,
    y: 0,
    width: canvas.width / 2,
    height: canvas.height / 2,
    top: function() {
	return this.y;
    },
    right: function() {
	return this.x + this.width;
    },
    bottom: function() {
	return this.y + this.height;
    },
    left: function() {
	return this.x;
    },
}

let genSprite = function(s) {
    return new Sprite(tm(s));
}

let genTile = function(s, w, h) {
    return new PIXI.TilingSprite(tm(s), w, h);
}

let flipSprites = function(r, d) {
    if(d === 'horizontal') r.sprites.map((s) => s.scale.x *= -1);
    else if(d === 'vertical') r.sprites.map((s) => s.scale.y *= -1);
    else {
	r.sprites.map((s) => s.scale.x *= -1);
	r.sprites.map((s) => s.scale.y *= -1);
    }
}

let singleDraw = function(obj) {
    obj.sprites[0].position.set(obj.x, obj.y);
}

// I could have surely done something clever to combine the left and right walls into one but meh
let rightWallDraw = function(obj) {
    let h = obj.y + obj.height;
    // bottom corner
    obj.sprites[0].position.set(obj.x, h - 32);
    // top corner
    obj.sprites[1].position.set(obj.x, obj.y);
    // inner surface
    obj.sprites[2].position.set(obj.x, obj.y + 32);
    // the dryer dirt in the middle    
    obj.sprites[3].position.set(obj.x + 32, obj.y + 32);
    // bottom transition blocks
    obj.sprites[4].position.set(obj.x + 32, h - 32);
    // top transition blocks
    obj.sprites[5].position.set(obj.x + 32, obj.y);
}

let leftWallDraw = function(obj) {
    let w = obj.x + obj.width;
    let h = obj.y + obj.height;
    // bottom corner
    obj.sprites[0].position.set(w - 32, h - 32);
    // top corner
    obj.sprites[1].position.set(w - 32, obj.y);
    // inner surface
    obj.sprites[2].position.set(w - 32, obj.y + 32);
    // the dryer dirt in the middle    
    obj.sprites[3].position.set(obj.x, obj.y + 32);
    // bottom transition blocks
    obj.sprites[4].position.set(obj.x, h - 32);
    // top transition blocks
    obj.sprites[5].position.set(obj.x, obj.y);
}

let accountForAnchor = function(obj) {
    obj.sprites.map((s) => {
	s.position.x += s.width / 2;
	s.position.y += s.height / 2;
    });
} // it's silly but necessary for rotations and reflections to operate with the origin as a pivot

let ceilingDraw = function(obj) {
    obj.sprites[0].position.set(obj.x, obj.y);
}

let floorDraw = function(obj) {
    obj.sprites[0].position.set(obj.x, obj.y);
    obj.sprites[1].position.set(obj.x, obj.y + 32);
}

let pushOntoLayer = function(obj, layerNum) {
    if(visibles[layerNum] === undefined) visibles[layerNum] = [];
    visibles[layerNum].push(obj);
}

let playerDraw = function(obj) {
    if(obj.desiredFacing !== obj.facing) flipSprites(obj, 'horizontal');
    obj.facing = obj.desiredFacing;
    obj.sprites[0].position.set(obj.x + obj.renderOffsetX, obj.y + obj.renderOffsetY);
}

let HUDDraw = function(obj) {
    obj.sprites.map((s) => {
	s.position.set(obj.x + viewport.x, obj.y + viewport.y);
    });
}

let redraw = function() {
    let r = new Object();
    r.x = -16;
    r.y = -16;
    r.width = viewport.width + 32;
    r.height = viewport.height + 32;
    visibles.map(x => {
	x.map(o => {
	    if(o.draw !== undefined) {
		o.x -= viewport.x;
		o.y -= viewport.y;
		if(o.name !== 11) { // clickable text has its own visibility management
		    o.sprites.map(s => {
			s.x -= s.width / 2;
			s.y -= s.height / 2;
			if(C.isRectInRect(s, r)) s.visible = true;
			else s.visible = false;
			s.x += s.width / 2;
			s.y += s.height / 2;
		    });
		}
		o.draw(o);
		accountForAnchor(o);
		o.x += viewport.x;
		o.y += viewport.y;
	    }
	});
    });
    // visibles is a list of lists, in order to allow for control over rendering layers
}

let clear = function() {
    visibles.length = 0;
    app.stage.children = [];
}

export default { viewport, redraw, visibles, pushOntoLayer, floorDraw, app, flipSprites, singleDraw,
		 xOffsetDelta, yOffsetDelta, playerDraw, genTile, ceilingDraw, clear, HUDDraw, 
		 rightWallDraw, leftWallDraw, singleDraw, genSprite, zoom, };
