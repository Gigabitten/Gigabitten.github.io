/* If anything seems redundant regarding visibility management, that's because I switched from
 * vanilla canvas bindings to pixi when it turned out that tiling textures is awful without some
 * sort of library to help.
 * 
 * Drawing is the same. Drawing used to do a bunch of canvas stuff and then pixi made rendering cake
 * so all I have to do is update sprite positions relative to the object.
 */
let app = new PIXI.Application({width: document.documentElement.clientWidth + 1,
				height: document.documentElement.clientHeight + 1,
				backgroundColor: 0x009933,
			  });
document.body.appendChild(app.view);

// pixi aliases
let tm = function() {
    return PIXI.loader.resources["img/spritesheet.json"].textures;
}
// can't evaluate right away since obviously img/spritesheet.json hasn't loaded yet.
// a function is a great method of delaying execution to the call for something
let Application = PIXI.Application;
let loader = PIXI.loader;
let resources = PIXI.loader.resources;
let Sprite = PIXI.Sprite;
let stage = app.stage;
let Graphics = PIXI.Graphics;

const zoom = 2;
stage.scale.x = zoom;
stage.scale.y = zoom;

let visibles = [];

let xOffsetDelta = { xO: 0 };
let yOffsetDelta = { yO: 0 };

let rect = function(w, h) {
    let rectangle = new Graphics();
    rectangle.beginFill(0x333333);
    rectangle.drawRect(0, 0, w, h);
    rectangle.endFill();
    app.stage.addChild(rectangle);
    return rectangle;
}

let viewport = {
    x: 0,
    y: 0,
    width: document.documentElement.clientWidth / 2,
    height: document.documentElement.clientHeight / 2,
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
    return new Sprite(tm()[s]);
}

let genTile = function(s, w, h) {
    return new PIXI.TilingSprite(tm()[s], w, h);
}

let flipSprites = function(r, d) {
    if(d === 'horizontal') r.sprites.map((s) => s.scale.x *= -1);
    else if(d === 'vertical') r.sprites.map((s) => s.scale.y *= -1);
    else {
	r.sprites.map((s) => s.scale.x *= -1);
	r.sprites.map((s) => s.scale.y *= -1);
    }
}

let addChildren = function(obj) {
    obj.sprites.map((s) => app.stage.addChild(s));
}

// I could have surely done something clever to combine the left and right walls into one but meh
let rightWallDraw = function(obj) {
    let h = obj.y + obj.height;
    // bottom corner
    obj.sprites[0].position.set(obj.x, h - 8);
    // top corner
    obj.sprites[1].position.set(obj.x, obj.y);
    // inner surface
    obj.sprites[2].position.set(obj.x, obj.y + 8);
    // the dryer dirt in the middle    
    obj.sprites[3].position.set(obj.x + 8, obj.y + 8);
    // bottom transition blocks
    obj.sprites[4].position.set(obj.x + 8, h - 8);
    // top transition blocks
    obj.sprites[5].position.set(obj.x + 8, obj.y);
}

let leftWallDraw = function(obj) {
    let w = obj.x + obj.width;
    let h = obj.y + obj.height;
    // bottom corner
    obj.sprites[0].position.set(w - 8, h - 8);
    // top corner
    obj.sprites[1].position.set(w - 8, obj.y);
    // inner surface
    obj.sprites[2].position.set(w - 8, obj.y + 8);
    // the dryer dirt in the middle    
    obj.sprites[3].position.set(obj.x, obj.y + 8);
    // bottom transition blocks
    obj.sprites[4].position.set(obj.x, h - 8);
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
    obj.sprites[0].position.set(obj.x, obj.y - 2);
    obj.sprites[1].position.set(obj.x, obj.y + 6);
}

let pushOntoLayer = function(obj, layerNum) {
    if(visibles[layerNum] === undefined) visibles[layerNum] = [];
    visibles[layerNum].push(obj);
}

let playerDraw = function(obj) {
    if(obj.facingActual === undefined) obj.facingActual = 2;
    if(obj.facingActual === 2 && obj.facing === 4) {
	obj.facingActual = 4;
	flipSprites(obj, 'horizontal');
    }
    if(obj.facingActual === 4 && obj.facing === 2) {
	obj.facingActual = 2;
	flipSprites(obj, 'horizontal');
    }
    obj.sprites[0].position.set(obj.x, obj.y);
}

let redraw = function() {
    visibles.map(x => {
	x.map(o => {
	    if(o.draw !== undefined) {
		o.x -= viewport.x;
		o.y -= viewport.y;
		o.draw(o);
		accountForAnchor(o);
		o.x += viewport.x;
		o.y += viewport.y;
	    }
	});
    });
    // visibles is a list of lists, in order to allow for control over rendering layers
}

export default { viewport, redraw, visibles, pushOntoLayer, floorDraw, app, flipSprites, 
		 xOffsetDelta, yOffsetDelta, playerDraw, genTile, addChildren, ceilingDraw, 
		 rightWallDraw, leftWallDraw, rect, genSprite, };
