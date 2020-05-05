import S from "./shapes.js";
import N from "./newton.js";
import F from "./frog.js";
import C from "./collision.js";
import R from "./render.js";
import U from "./utils.js";
import M1 from "./map1.js";
import M2 from "./map2.js";

let makeHUD = function() {
    let HUDScore = new Object();
    S.text(`0`, 1, 0, 10, HUDScore);
    HUDScore.physicsBehaviors = [
	function(obj) {
	    obj.sprites[0].text = `${F.player.score}/${F.player.neededScore}`;
	},
    ];
    N.bodies.push(HUDScore);
    HUDScore.draw = R.HUDDraw;

    let ffXr1 = Math.random() * 10;
    let ffYr1 = Math.random() * 10;
    let ffXr2 = Math.random() * 20 + 20;
    let ffYr2 = Math.random() * 20 + 20;
    let HUDFirefly = new Object();
    S.firefly(16, 16, function(obj) {
	return obj.baseX - ffXr1 * Math.cos(obj.counter / ffXr2);	
    }, function(obj) {
	return obj.baseY - ffYr1 * Math.sin(obj.counter / ffYr2);	
    }, HUDFirefly);
    HUDFirefly.draw = R.HUDDraw;
    HUDFirefly.collisionHandler = undefined;
}

let clearEverything = function() {
    N.clear();
    R.clear();
    C.clear();

    U.deleteObject(F.player);
}

let map1 = function() {
    clearEverything();
    M1.load();
    makeHUD();
    S.checkpoint(42, 13, function(obj) {
	if(obj.score >= obj.neededScore) map2();
    });
}

let map2 = function() {
    clearEverything();
    M2.load();
    makeHUD();
    S.checkpoint(15, 30, function(obj) {
	if(obj.score >= obj.neededScore) map1();
    });
}

export default { map1, map2, };
