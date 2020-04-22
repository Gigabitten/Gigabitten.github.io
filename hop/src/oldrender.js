// This was the rendering before I swapped to webgl. Harder to use, but at least I can control it.
// 2d context is awful. So many unmanageable, unpredictable side-effects. Keeping this just in case.

/* Note that this aren't my screen height and width, they're the height and width of the smallest
 * screen size which is common. If somebody has an absolutely enormous screen, they can just zoom in.
 * Getting screen dimensions with js is actually a nightmare. 
 */
const context = document.querySelector("canvas").getContext("2d");
// the matrix makes transformations readable, mostly. 
var matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();

let visibles = [];
let sprites = [];
let textures = [];

let xOffsetDelta = { xO: 0 };
let yOffsetDelta = { yO: 0 };

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

let rectDraw = function(obj) {
    context.fillStyle = obj.color;
    context.fillRect(obj.x, obj.y, obj.width, obj.height)
}

let playerDraw = function(obj) {
    context.drawImage(obj.sprite, obj.x, obj.y);
}
// I could have surely done something clever to combine the left and right walls into one but meh
let rightWallDraw = function(obj) {
    patternDraw(obj, (obj) => {
	// top and bottom corners
	textures[3].setTransform(matrix.flipY());
	context.fillStyle = textures[3];
	context.fillRect(0, 0, 8, 8);
	textures[3].setTransform(matrix.flipY());
	context.fillRect(0, obj.height - 8, 8, 8);
	// transition blocks
	textures[5].setTransform(matrix.flipY());
	context.fillStyle = textures[5];
	context.fillRect(8, 0, obj.width - 8, 8);
	textures[5].setTransform(matrix.flipY());
	context.fillRect(8, obj.height - 8, obj.width - 8, 8);
	// inner surface
	context.fillStyle = textures[2];
	context.fillRect(0, 8, 8, obj.height - 16);
	// the dryer dirt in the middle
	context.fillStyle = textures[4];
	context.fillRect(8, 8, obj.width - 8, obj.height - 16);
    });
}

let leftWallDraw = function(obj) {
    patternDraw(obj, (obj) => {
	// flipping horizontally
	[textures[2], textures[3], textures[4], textures[5]].map((x)=>x.setTransform(matrix.flipX()));
	// top and bottom corners
	textures[3].setTransform(matrix.flipY());
	context.fillStyle = textures[3];
	context.fillRect(obj.width - 8, 0, 8, 8);
	textures[3].setTransform(matrix.flipY());
	context.fillRect(obj.width - 8, obj.height - 8, 8, 8);
	// transition blocks
	textures[5].setTransform(matrix.flipY());
	context.fillStyle = textures[5];
	context.fillRect(0, 0, obj.width - 8, 8);
	textures[5].setTransform(matrix.flipY());
	context.fillRect(0, obj.height - 8, obj.width - 8, 8);
	// inner surface
	context.fillStyle = textures[2];
	context.fillRect(obj.width - 8, 8, 8, obj.height - 16);
	// the dryer dirt in the middle
	context.fillStyle = textures[4];
	context.fillRect(0, 8, obj.width - 8, obj.height - 16);
	// flipping back
	[textures[2], textures[3], textures[4], textures[5]].map((x)=>x.setTransform(matrix.flipX()));
    });
}

let floorDraw = function(obj) {
    patternDraw(obj, (obj) => {
	context.fillStyle = textures[0];
	// Refer to position as if 0,0 was the top left of the rect. If you don't do this and the
	// transformation when working with a pattern, the pattern origin won't move with the viewport
	context.fillRect(0, 0, obj.width, 8); 
	context.fillStyle = textures[1];
	context.fillRect(0, 8, obj.width, obj.height - 8);
    });
}

// Patterns are weird. Just trust these translations. They fix a serious bug.
let patternDraw = function(obj, f) {
    context.translate(obj.x, obj.y); 
    f(obj);
    context.translate(-obj.x, -obj.y);
}

let loadPatterns = function() {
    textures[0] = context.createPattern(sprites[1], 'repeat');
    textures[1] = context.createPattern(sprites[2], 'repeat');
    textures[2] = context.createPattern(sprites[3], 'repeat');
    textures[3] = context.createPattern(sprites[4], 'repeat');
    textures[4] = context.createPattern(sprites[5], 'repeat');
    textures[5] = context.createPattern(sprites[6], 'repeat');
}

let pushOntoLayer = function(obj, layerNum) {
    if(visibles[layerNum] === undefined) visibles[layerNum] = [];
    visibles[layerNum].push(obj);
}
// this was kinda a dumb idea but I don't care enough to get rid of it
let spritify = function(obj, i) {
    obj.sprite = sprites[i]; 
    obj.draw = playerDraw;
}

let redraw = function() {
    context.fillStyle = "#009933";
    context.fillRect(0, 0, viewport.width, viewport.height);
    /* important! clears the screen each frame. without this, drawing happens, but nothing gets
     * cleared. This is the standard for drawing 2d to a screen, at least for small-scale unoptimized 
     * stuff - wipe everything by clearing it with a rectangle across it, then rebuild.
     */
    visibles.map(x => {
	x.map(o => {
	    if(o.draw !== undefined) {
		o.x -= viewport.x;
		o.y -= viewport.y;
		o.draw(o);
		o.x += viewport.x;
		o.y += viewport.y;
	    }
	});
    });
    // visibles is a list of lists, in order to allow for control over rendering layers
}

export default { viewport, context, redraw, visibles, rectDraw, pushOntoLayer, floorDraw, 
		 xOffsetDelta, yOffsetDelta, playerDraw, spritify, sprites, loadPatterns,
		 rightWallDraw, leftWallDraw, };
