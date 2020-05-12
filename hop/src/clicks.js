import C from "./collision.js";
import R from "./render.js";

let clickables = [];

let clickHandler = function(e) {
    clickables.map(o => {
	o.x -= R.viewport.x;
	o.y -= R.viewport.y;
	if(C.isPointInRect(o, e.clientX / R.zoom, e.clientY / R.zoom) && o.sprites[0].visible) {
	    o.clickHandler();
	}
	o.x += R.viewport.x;
	o.y += R.viewport.y;
    });
}

export default { clickHandler, clickables, };
