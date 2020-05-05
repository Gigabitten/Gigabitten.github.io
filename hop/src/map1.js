import S from "./shapes.js"
import N from "./newton.js";
import F from "./frog.js";
import C from "./collision.js";
import R from "./render.js";

// Loading order actually determines rendering order. Load the things you want on top last.
// Some coordinates are specified in multiples of 32. Some are not. I hope which is which is clear.

let load = function() {
    R.viewport.minX = -1024;
    R.viewport.minY = -64;
    R.viewport.maxX = 1300;
    R.viewport.maxY = 950;

    S.floor(-64, 32, 128, 64); // lower floor
    
    S.floor(8, 22, 16, 1); // platform

    S.wall(27, 16, 64, 17, 2); // right wall
    S.floor(27, 15, 64, 1); // upper floor

    S.firefly(512, 712, function(obj) { // circling firefly
	return obj.baseX - 300 * Math.cos(obj.counter / 120);
    }, function(obj) {
	return obj.baseY + 100 * Math.sin(obj.counter / 120);
    });

    S.firefly(-200, 980, function(obj) { // jump firefly
	return obj.baseX - 4 * Math.cos(obj.counter / 40);
    }, function(obj) {
	return obj.baseY - 2 * Math.sin(obj.counter / 20);
    });

    S.firefly(1100, 325, function(obj) { // upper firefly
	return obj.baseX - 2 * Math.cos(obj.counter / 8);
    }, function(obj) {
	return obj.baseY - 50 * Math.sin(obj.counter / 20);
    });

    S.firefly(-550, 1000, function(obj) { // first firefly
	return obj.baseX - 3 * Math.cos(obj.counter / 40);
    }, function(obj) {
	return obj.baseY - Math.sin(obj.counter / 20);
    });

    S.firefly(810, 590, function(obj) { // wall firefly
	return obj.baseX - Math.cos(obj.counter / 40);
    }, function(obj) {
	return obj.baseY - 4 * Math.sin(obj.counter / 20);
    });

    S.text(`\u25C0 \u25B6`, -28, 28, 10);
    S.text(`\u25B2`, -6.5, 28, 10);
    S.text(`\u25B2+\u25B6`, 23, 30, 10);
    S.text(`\u25B2\n\u25BC`, 25, 24, 10);
    S.text(`\u25C0`, 24, 18, 10);

    F.makeFrog(F.player);
    F.player.xSpawn = -900;
    F.player.ySpawn = 960;
    F.player.neededScore = 5;
    F.player.respawn();
}

export default { load, }
