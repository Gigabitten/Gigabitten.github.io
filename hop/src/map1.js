import S from "./shapes.js"
import N from "./newton.js";
import F from "./frog.js";
import C from "./collision.js";
import R from "./render.js";

// Loading order actually determines rendering order. Load the things you want on top last.

let load = function() {
    R.viewport.minX = -1000;
    R.viewport.minY = -64;
    R.viewport.maxX = 1536;
    R.viewport.maxY = 1088;

    S.floor(-2048, 1024, 4096, 2048);
    S.wall(850, 512, 2048, 544, 2);

    S.floor(256, 712, 512, 32);

    S.floor(850, 480, 2048, 32);

    S.firefly(512, 712, function(obj) {
	return obj.baseX - 300 * Math.cos(obj.counter / 120);
    }, function(obj) {
	return obj.baseY + 100 * Math.sin(obj.counter / 120);
    });

    S.firefly(-200, 980, function(obj) {
	return obj.baseX - 4 * Math.cos(obj.counter / 40);
    }, function(obj) {
	return obj.baseY - Math.sin(obj.counter / 20);
    });

    S.firefly(1100, 325, function(obj) {
	return obj.baseX - 2 * Math.cos(obj.counter / 8);
    }, function(obj) {
	return obj.baseY - 50 * Math.sin(obj.counter / 20);
    });

    F.makeFrog(F.player);
    F.player.xSpawn = -900;
    F.player.ySpawn = 960;
    F.player.neededScore = 3;
    F.player.respawn();
}

export default { load, }
