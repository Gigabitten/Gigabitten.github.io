import S from "./shapes.js"
import N from "./newton.js";
import F from "./frog.js";
import C from "./collision.js";
import R from "./render.js";

let load = function() {
    R.viewport.minX = -64;
    R.viewport.minY = -544;
    R.viewport.maxX = 1024;
    R.viewport.maxY = 1056;

    S.floor(-64, 32, 128, 64); // lower floor
    S.wall(-4, -16, 3, 49, 4); // far left wall
    S.wall(31, -16, 3, 49, 2); // far right wall
    S.ceiling(-4, -17, 38, 1); // ceiling
    S.floatingIsland(1, 18, 28, 4); // lower wide island
    S.floatingIsland(1, 7, 28, 4); // upper island floor
    S.floatingIsland(25, -12, 4, 20); // upper island right wall
    S.floatingIsland(15, -12, 4, 15); // upper island left wall

    S.firefly(0, 704, function(obj) { // lower left firefly
	return obj.baseX - 8 * Math.cos(obj.count / 30);
    }, function(obj) {
	return obj.baseY + 3 * Math.sin(obj.count / 20);
    });

    S.firefly(960, 704, function(obj) { // lower right firefly
	return obj.baseX - 5 * Math.cos(obj.count / 40);
    }, function(obj) {
	return obj.baseY + 7 * Math.sin(obj.count / 35);
    });

    S.firefly(0, 192, function(obj) { // middle left firefly
	return obj.baseX - 6 * Math.cos(obj.count / 20);
    }, function(obj) {
	return obj.baseY + 2 * Math.sin(obj.count / 25);
    });

    S.firefly(704, 0, function(obj) { // first shaft firefly
	return obj.baseX - 2 * Math.cos(obj.count / 30);
    }, function(obj) {
	return obj.baseY + 5 * Math.sin(obj.count / 25);
    });

    S.firefly(704, -256, function(obj) { // second shaft firefly
	return obj.baseX - 5 * Math.cos(obj.count / 30);
    }, function(obj) {
	return obj.baseY + 5 * Math.sin(obj.count / 30);
    });

    S.firefly(544, -448, function(obj) { // top left firefly
	return obj.baseX - 8 * Math.cos(obj.count / 30);
    }, function(obj) {
	return obj.baseY + 2 * Math.sin(obj.count / 40);
    });

    S.firefly(864, -448, function(obj) { // top right firefly
	return obj.baseX - 1 * Math.cos(obj.count / 40);
    }, function(obj) {
	return obj.baseY + 3 * Math.sin(obj.count / 20);
    });    

    F.makeFrog(F.player);
    F.player.xSpawn = 0;
    F.player.ySpawn = 960;
    F.player.neededScore = 7;
    F.player.respawn();
}

export default { load, }
