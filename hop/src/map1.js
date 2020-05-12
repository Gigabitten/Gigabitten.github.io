import S from "./shapes.js"
import N from "./newton.js";
import F from "./frog.js";
import C from "./collision.js";
import R from "./render.js";

// Loading order actually determines rendering order. Load the things you want on top last.
// Some coordinates are specified in multiples of 32. Some are not. I think which is which is clear.

let load = function() {
    R.viewport.minX = -1024;
    R.viewport.minY = -64;
    R.viewport.maxX = 1440;
    R.viewport.maxY = 1056;

    S.floor(-64, 32, 128, 64); // lower floor
    S.wall(-36, -1, 5, 34, 4); // far left wall
    S.ceiling(-36, -2, 128, 1); // ceiling
    S.floor(8, 22, 16, 1); // platform
    S.wall(27, 16, 64, 17, 2); // right wall
    S.floor(27, 15, 64, 1); // upper floor
    S.wall(44, -2, 5, 18, 2); // far right wall

    S.firefly(512, 712, function(obj) { // circling firefly
	return obj.baseX - 300 * Math.cos(obj.count / 120);
    }, function(obj) {
	return obj.baseY + 100 * Math.sin(obj.count / 120);
    });
    S.firefly(-200, 980, function(obj) { // jump firefly
	return obj.baseX - 4 * Math.cos(obj.count / 40);
    }, function(obj) {
	return obj.baseY - 2 * Math.sin(obj.count / 20);
    });
    S.firefly(1100, 325, function(obj) { // upper firefly
	return obj.baseX - 2 * Math.cos(obj.count / 8);
    }, function(obj) {
	return obj.baseY - 50 * Math.sin(obj.count / 20);
    });
    S.firefly(-550, 1000, function(obj) { // first firefly
	return obj.baseX - 3 * Math.cos(obj.count / 40);
    }, function(obj) {
	return obj.baseY - Math.sin(obj.count / 20);
    });
    S.firefly(810, 590, function(obj) { // wall firefly
	return obj.baseX - Math.cos(obj.count / 40);
    }, function(obj) {
	return obj.baseY - 4 * Math.sin(obj.count / 20);
    });

    S.text(`\u25C0 \u25B6`, -28, 28, 10);
    S.text(`Escape - Main Menu`, -22, 28, 10);
    S.text(`R - Restart Level`, -22, 29, 10);
    S.text(`\u25B2`, -6.5, 28, 10);
    S.text(`\u25B2+\u25B6`, 23, 30, 10);
    S.text(`\u25B2\n\u25BC`, 25, 24, 10);
    S.text(`\u25C0`, 24, 18, 10);
    S.text(`Get all the fireflies!`, 30, 10, 10);

    F.makeFrog(F.player);
    F.player.xSpawn = -900;
    F.player.ySpawn = 960;
    F.player.neededScore = 5;
    F.player.respawn();
}

export default { load, }
