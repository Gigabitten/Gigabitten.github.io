import N from "./newton.js";
import R from "./render.js";
import C from "./collision.js";

let deleteObject = function(obj) {
    N.bodies.map((x, index) => {
	if(x === obj) N.bodies.splice(index, 1);
    });
    C.colliders.map((x, index) => {
	if(x === obj) C.colliders.splice(index, 1);
    });
    R.visibles.map((y, index1) => {
	y.map((x, index2) => {
	    if(x === obj) R.visibles[index1].splice(index2, 1);
	});
    });
}

export default { deleteObject, };
