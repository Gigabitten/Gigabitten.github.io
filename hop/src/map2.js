import S from "./shapes.js"
import N from "./newton.js";
import F from "./frog.js";
import C from "./collision.js";
import R from "./render.js";

let load = function() {
    R.viewport.minX = -128;
    R.viewport.minY = 32;
    R.viewport.maxX = 1440;
    R.viewport.maxY = 1056;

    S.floor(12, 25, 8, 8); // raised platform near start
    S.floor(-64, 32, 128, 64); // lower floor
    S.wall(-8, 20, 5, 13, 4); // far left wall    
    S.floor(17, 10, 13, 1); // overhang floor
    S.wall(44, 11, 5, 22, 2); // far right wall
    S.wall(-20, 2, 32, 18, 4); // high left wall leading to upper corridor
    S.wall(20, 11, 10, 22, 2); // right wall leading to overhang
    S.wall(17, 11, 13, 4, 2); // overhang
    S.wall(29, 11, 1, 22, 4); // left wall corresponding to "right wall leading to overhang"
    S.ceiling(-20, -10, 70, 12); // the, well, the ceiling
    S.floor(42, 7, 4, 1); // right overhang floor
    S.wall(42, 8, 4, 4, 2); // right overhang
    S.wall(44, 2, 5, 6, 2); // far right wall
    
    S.firefly(512, 736, function(obj) { // lower platform firefly
	return obj.baseX - 8 * Math.cos(obj.count / 40);
    }, function(obj) {
	return obj.baseY + 3 * Math.sin(obj.count / 20);
    });

    S.firefly(480, 416, function(obj) { // lower platform firefly
	return obj.baseX - 3 * Math.cos(obj.count / 25);
    }, function(obj) {
	return obj.baseY + 7 * Math.sin(obj.count / 30);
    });

    S.firefly(512, 80, function(obj) { // lower platform firefly
	return obj.baseX - 5 * Math.cos(obj.count / 30);
    }, function(obj) {
	return obj.baseY + 6 * Math.sin(obj.count / 35);
    });    
    
    F.makeFrog(F.player);
    F.player.xSpawn = 0;
    F.player.ySpawn = 960;
    F.player.neededScore = 3;
    F.player.respawn();
}

export default { load, }
