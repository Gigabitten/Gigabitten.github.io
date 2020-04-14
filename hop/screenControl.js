import R from "./render.js";
import F from "./frog.js";

const scrollSpeed = 0.06;

let scroll = function() {
    R.xOffsetDelta.xO = (R.gameWidth / 2 - F.player.x) * scrollSpeed;
    R.yOffsetDelta.yO = (R.gameHeight / 2 - F.player.y) * scrollSpeed;
}

export default { scroll, };
