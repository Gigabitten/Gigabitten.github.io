import S from "./shapes.js";
import N from "./newton.js";
import F from "./frog.js";
import C from "./collision.js";
import R from "./render.js";
import U from "./utils.js";
import M1 from "./map1.js";
import M2 from "./map2.js";

let clearEverything = function() {
    N.clear();
    R.clear();
    C.clear();

    U.deleteObject(F.player);
}

let map1 = function() {
    clearEverything();
    M1.load();
    S.checkpoint(1350, 425, function(obj) {
	if(obj.neededScore === obj.score) map2();
    });
}

let map2 = function() {
    clearEverything();
    M2.load();
    S.checkpoint(468, 972, function(obj) {
	if(obj.neededScore === obj.score) map1();
    });
}

export default { map1, map2, };



