import R from "./render.js";
import F from "./frog.js";

const scrollSpeed = 0.06;

let scroll = function() {
    R.viewport.x += (R.viewport.width / 2 - (F.player.x + R.viewport.x)) * scrollSpeed;
    R.viewport.y += (R.viewport.height / 2 - (F.player.y + R.viewport.y)) * scrollSpeed;
}

let updateView = function() {
    R.viewport.width = document.documentElement.clientWidth,
    R.viewport.height = document.documentElement.clientHeight,
    R.context.canvas.width = R.viewport.width;
    R.context.canvas.height = R.viewport.height;
}

export default { scroll, updateView, };
