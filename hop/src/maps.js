import S from "./shapes.js";
import N from "./newton.js";
import F from "./frog.js";
import C from "./collision.js";
import R from "./render.js";
import U from "./utils.js";
import M1 from "./map1.js";
import M2 from "./map2.js";
import M3 from "./map3.js";

let sleep = function(ms) {
    let t = performance.now();
    while(performance.now() < t + ms) {

    }
}

let div = function(n, m, c) {
    let r = `${Math.floor(n / m) % m}`;
    return r.length < 2 ? `0${r}${c}` : `${r}${c}`;
}

let dropWhile = function(s, f) {
    while(f(s[0]) && s.length !== 0) s = s.slice(1);
    return s;
}

let makeTimeString = function(frames) {
    return dropWhile([[216000,':'],[3600,':'],[60,'']]
		     .map(([x,c]) => div(frames, x, c))
		     .concat([`${Math.round(((frames % 60) / 60) * 100) / 100}`.slice(1)])
    		     .join(""),
		     (s) => s === ':' || s === '0')
}

let makeHUD = function() {
    let HUDScore = new Object();
    S.text(`0`, 1, 1, 10, HUDScore);
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
    S.firefly(16, 48, function(obj) {
	return obj.baseX - ffXr1 * Math.cos(obj.count / ffXr2);
    }, function(obj) {
	return obj.baseY - ffYr1 * Math.sin(obj.count / ffYr2);
    }, HUDFirefly);
    HUDFirefly.draw = R.HUDDraw;
    HUDFirefly.collisionHandler = undefined;

    let HUDTimer = new Object();
    S.text('0.00', 0, 0, 10, HUDTimer);
    HUDTimer.physicsBehaviors = [
	function(obj) {
	    if(obj.count === undefined) obj.count = 0;
	    obj.count++;	    
	    obj.sprites[0].text = makeTimeString(obj.count);
	},
    ];
    N.bodies.push(HUDTimer);
    HUDTimer.draw = R.HUDDraw;
}

let clearEverything = function() {
    N.clear();
    R.clear();
    C.clear();

    U.deleteObject(F.player);
}

let map1 = function() {
    F.player.map = map1;
    clearEverything();
    M1.load();
    S.checkpoint(41, 13, function(obj) {
	if(obj.score >= obj.neededScore) {
	    map2();
	}
    });
    makeHUD();
    sleep(500); // putting these here just so that the player has time to see their time
}

let map2 = function() {
    F.player.map = map2;
    clearEverything();
    M2.load();
    S.checkpoint(42, 5, function(obj) {
	if(obj.score >= obj.neededScore) map3();
    });
    makeHUD();
    sleep(500);
}

let map3 = function() {
    F.player.map = map3;
    clearEverything();
    M3.load();
    S.checkpoint(21, -14, function(obj) {
	if(obj.score >= obj.neededScore) end();
    });
    makeHUD();
    sleep(500);
}

let end = function() {
    clearEverything();
    R.viewport.x = 0;
    R.viewport.y = 0;
    R.viewport.minX = -64;
    R.viewport.minY = -64;
    R.viewport.maxX = 1088;
    R.viewport.maxY = 1088;

    let PlayButton = new Object();
    S.text("You did it!\n\n\nPress Escape to return to the main menu.", 8.5, 25, 20);

    S.floor(-64, 32, 128, 64);
    S.ceiling(-64, -64, 128, 64);
    S.wall(-64, 0, 64, 33, 4);
    S.wall(32, 0, 64, 33, 2);

    F.makeFrog(F.player);
    F.player.xSpawn = 500;
    F.player.ySpawn = 960;
    F.player.respawn();
}

let MM = function() { // main menu
    clearEverything();
    F.player.controls = false;
    R.viewport.x = 0;
    R.viewport.y = 0;
    R.viewport.minX = -64;
    R.viewport.minY = -64;
    R.viewport.maxX = 1088;
    R.viewport.maxY = 1088;

    let PlayButton = new Object();
    S.clickableText("Play", 8.5, 30, 4, () => {
	F.player.controls = true;
	map1();
    }, PlayButton);

    let L1 = new Object();
    S.clickableText("1", 8.5, 27.5, 1, () => {
	F.player.controls = true;
	map1();
    }, L1);
    L1.sprites[0].visible = false;    

    let L2 = new Object();    
    S.clickableText("2", 13, 29, 1, () => {
	F.player.controls = true;
	map2();
    }, L2);
    L2.sprites[0].visible = false;    
    
    let L3 = new Object();
    S.clickableText("3", 18, 30, 1, () => {
	F.player.controls = true;
	map3();
    }, L3);
    L3.sprites[0].visible = false;    

    let LevelSelect = new Object();
    LevelSelect.toggled = false;
    S.clickableText("Select Stage", 16, 27.5, 7, () => {
	LevelSelect.toggled = !LevelSelect.toggled;
	if(LevelSelect.toggled) LevelSelect.sprites[0].text = "Back";
	else LevelSelect.sprites[0].text = "Select Stage";
	[PlayButton, L1, L2, L3].map(x => x.sprites[0].visible = !x.sprites[0].visible);
    }, LevelSelect);

    S.floor(-64, 32, 128, 64);
    S.ceiling(-64, -64, 128, 64);
    S.wall(-64, 0, 64, 33, 4);
    S.wall(32, 0, 64, 33, 2);

    F.makeFrog(F.player);
    F.player.xSpawn = 500;
    F.player.ySpawn = 960;
    F.player.respawn();
}

export default { map1, map2, MM, };
