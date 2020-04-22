import R from "./render.js";
import F from "./frog.js";

const scrollSpeed = 0.1;
// 0.1 feels nice, it's inadvisable to set this to a number greater than 1 if you have epilepsy

let scroll = function() {
    // frankly this is hard to understand because it seems like technically 
    R.viewport.x -= ((R.viewport.left() + R.viewport.right()) / 2 - F.player.x) * scrollSpeed;
    R.viewport.y -= ((R.viewport.top() + R.viewport.bottom()) / 2 - F.player.y) * scrollSpeed;
    if(R.viewport.left() < R.viewport.minX) R.viewport.x = R.viewport.minX;
    if(R.viewport.right() > R.viewport.maxX) R.viewport.x = R.viewport.maxX - R.viewport.width;
    if(R.viewport.top() < R.viewport.minY) R.viewport.y = R.viewport.minY;
    if(R.viewport.bottom() > R.viewport.maxY) R.viewport.y = R.viewport.maxY - R.viewport.height;
}

let updateView = function() {
    // adding 1 is necessary or it will have bits at the edges    
    let width = document.documentElement.clientWidth + 1;
    let height = document.documentElement.clientHeight + 1;
    R.app.renderer.resize(width, height);
    R.viewport.width = width / R.app.stage.scale.x;
    R.viewport.height = height / R.app.stage.scale.y;
}

export default { scroll, updateView, };
