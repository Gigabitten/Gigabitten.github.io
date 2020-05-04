import S from "./shapes.js"
import N from "./newton.js";
import F from "./frog.js";
import C from "./collision.js";
import R from "./render.js";

// Loading order actually determines rendering order. Load the things you want on top last.

let load = function() {
    R.viewport.x = 0;
    R.viewport.y = 0;
    R.viewport.minX = -64;
    R.viewport.minY = -64;
    R.viewport.maxX = 1088;
    R.viewport.maxY = 1088;

    S.floor(-2048, 1024, 4096, 2048);
    S.ceiling(-2048, -2048, 4096, 2048);
    S.wall(-2048, 0, 2048, 1056, 4);
    S.wall(1024, 0, 2048, 1056, 2);

    S.firefly(200, 930);
    F.makeFrog(F.player);
    F.player.xSpawn = 500;
    F.player.ySpawn = 960;
    F.player.neededScore = 1;
    F.player.respawn();
}

export default { load, }
