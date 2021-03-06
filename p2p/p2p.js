let app = document.getElementById("app");
let peerIdSpace = document.getElementById("peerId");
let inputId = document.getElementById("inputId");
let conn;

let id = randomHexString(7);
console.log(id);
let user = new Peer(id);

function randomHexString(length) {
    let allowedChars = "0123456789abcdef";
    let s = "";
    for(let i = 0; i < length; i++) {
	s += allowedChars[Math.floor(Math.random() * 15)];
    }
    return s;
}

var host;

function connect() {
    conn = user.connect(document.getElementById("idBox").value, {
	reliable: true,
    });
    host = true;
    begin();
};

function checkEnter(e, f) {
    if(e.keyCode == 13) {
	f();
    }
}

user.on("open", (id) => {
    let idText = "Your ID: " + id;
    peerIdSpace.innerHTML = idText;
    // there are better ways to do this, but none that
    // indent correctly in my editor that I know of
    inputId.innerHTML = [
	'Input an ID:',
	'<div class="input-group mb-3">',
	'<div class="input-group-prepend" id="messages">',
	'<button  type="button" class="btn btn-secondary" id="connectBtn">',
	'Connect</button>',
	'</div>',
	'<input type="text" class="form-control" id="idBox" ',
	'placeholder="Enter a friend\'s ID to connect!">',
	'</div>',
	'Alternatively, wait for a connection!',
    ].join("");
    document.getElementById("idBox").addEventListener("keypress", (event) => {
	checkEnter(event, connect);
    });
    document.getElementById("connectBtn").addEventListener("click", connect);
});

user.on("connection", (recievedConn) => {
    conn = recievedConn;
    host = false;
    begin();
});

var t0;
var syncTo;
var timeRecieved = false;
var secTime;
var timeSet = false;
var p1;
var p2;
var gravity = 1.3;

var ready = false;

function begin() {
    app.innerHTML = "";
    run();
}

function run() {
    var scene = new Array();

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;

    create();

    window.requestAnimationFrame(gameLoop);

    var frame = 0;
    var delay = 3;
    var input = {
	left: false,
	right: false,
	up: false,
    };
    var lastGoodFrame = 0;

    window.addEventListener("keydown", handleInput);
    window.addEventListener("keyup", handleInput);

    conn.on("data", (data) => {
	// string comparison is slightly slow, I know,
	// but this is *very* easy to read
	if(data.type === "timeSetup" && !ready) {
	    t0 = data.time;
	    ready = true;
	}
	if(data.type === "timeSync") {
	    syncTo = data.time;
	    timeRecieved = true;
	}
	if(data.type === "update") {
	    handleRemoteInput(data);
	}
    });

    function equalInputs(a, b) {
	return (a.left === b.left &&
		a.right === b.right &&
		a.up === b.up);
    }

    function setState(p, state) {
	p.x = state.x;
	p.y = state.y;
	p.vx = state.vx;
	p.vy = state.vy;
	p.onFloor = state.onFloor;	
    }        

    function rollback(frameTo) {
	console.log("Rolled back!");
	[p1,p2].map(p => setState(p, p.stateQueue[frameTo]));
    }

    function handleRemoteInput(data) {
	var startFrame = frame;
	lastGoodFrame = data.schedFrame;
	p2.inputQueue = p2.inputQueue.splice(data.schedFrame - 1, 1);
	if(typeof p2.inputQueue[data.schedFrame] == "undefined") {
	    p2.inputQueue[data.schedFrame] = data.input;
	} else {
	    if(!equalInputs(data.input, p2.inputQueue[data.schedFrame]) &&
	       data.schedFrame < frame) {
		frame = data.schedFrame;
		rollback(data.schedFrame);
		p2.inputQueue[data.schedFrame] = data.input;
		while(frame != startFrame) update();
	    }
	}
    }

    // handleInput was more or less written by Addie Meders,
    // in a previous project we did together
    function handleInput(e) {
	var key_state = e.type == "keydown";
	switch(e.keyCode) {
	case 65: //A Key
	case 37: //Left Key
	    input.left = key_state;
	    break;

	case 87: //W Key
	case 38: //Up Key
	case 32: // spacebar
	    input.up = key_state;
	    break;

	case 68: //D Key
	case 39: //Right Key
	    input.right = key_state;
	    break;
	}
    }

    function drawCircle(obj) {
	ctx.fillStyle = obj.color;
	ctx.beginPath();
	ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
	ctx.fill();
    }

    function create() {
	var floor = {
	    draw: function(obj) {
		ctx.fillStyle = "#888888";
		ctx.fillRect(150, 500, 500, 100);
	    },
	};

	p1 = {
	    x: 250,
	    y: 100,
	    vx: 0,
	    vy: 0,
	    ax: 0,
	    ay: gravity,
	    xSpawn: 250,
	    ySpawn: 100,
	    radius: 20,
	    color: "#00ff00",
	    inputQueue: new Array(),
	    stateQueue: new Array(),
	    draw: drawCircle,
	};
	p2 = {
	    x: 550,
	    y: 100,
	    vx: 0,
	    vy: 0,
	    ax: 0,
	    ay: gravity,
	    xSpawn: 550,
	    ySpawn: 100,
	    radius: 20,
	    color: "#ff0000",
	    inputQueue: new Array(),
	    stateQueue: new Array(),	    
	    draw: drawCircle,
	};
	[p1,p2].map(p => p.inputQueue.push({
	    left: false,
	    right: false,
	    up: false,
	}));

	scene = [floor, p1, p2];

	if(host) {
	    // nothing here right now
	} else {
	    var temp = p1;
	    p1 = p2;
	    p2 = temp;
	}
    }

    function floorCheck(obj) {
	if(150 <= obj.x && obj.x <= 650 && obj.y + obj.radius >= 500) {
	    obj.vy = 0;
	    obj.y = 500 - obj.radius;
	    obj.onFloor = true;
	}
    }

    function collide() {
	[p1,p2].map(o => floorCheck(o));

	// custom collision checking because the basic
	// check is weird with shapes and it's easyish
	var xDist = p1.x - p2.x;
	var yDist = p1.y - p2.y;
	var dist = Math.sqrt(xDist * xDist + yDist * yDist);
	var outerDist = dist - p1.radius - p2.radius;
	if(outerDist < 0) {
	    // static collision resolution
	    p1.x -= (outerDist / 2) * (p1.x - p2.x) / dist;
	    p1.y -= (outerDist / 2) * (p1.y - p2.y) / dist;
	    p2.x += (outerDist / 2) * (p1.x - p2.x) / dist;
	    p2.y += (outerDist / 2) * (p1.y - p2.y) / dist;

	    // dynamic collision resolution - formula off of
	    // wikipedia page for elastic collisions
	    var nx = xDist / dist;
	    var ny = yDist / dist;

	    var kx = p1.vx - p2.vx;
	    var ky = p1.vy - p2.vy;

	    var p = nx * kx + ny * ky;

	    p1.vx -= p * nx;
	    p1.vy -= p * ny;
	    p2.vx += p * nx;
	    p2.vy += p * ny;
	}
    }

    function fixState(state) {
	p2.x = state.x;
	p2.y = state.y;
	p2.vx = state.vx;
	p2.vy = state.vy;
    }

    function getState(p, frame) {
	if(arguments.length === 1) {
	    return {
		x: p.x,
		y: p.y,
		vx: p.vx,
		vy: p.vy,
		onFloor: p.onFloor,
	    };
	} else {
	    return p.stateQueue[frame];
	}
    }

    function sleep(duration) {
	let t = Date.now();
	let i = 0;
	while(Date.now() < t + duration) { i++; }
    }

    function doPhysics(obj) {
	obj.x += obj.vx;
	obj.y += obj.vy;
	
	var maxV = 10;
	if(Math.abs(obj.vx + obj.ax) <= maxV) obj.vx += obj.ax;
	obj.vy += obj.ay;

	if(obj.y > 600) {
	    obj.vx = 0;
	    obj.vy = 0;
	    obj.x = obj.xSpawn;
	    obj.y = obj.ySpawn;
	}

	if(obj.onFloor) obj.vx *= 0.97;
    }

    function render() {
	ctx.clearRect(0, 0, width, height);
	scene.map(obj => {
	    obj.draw(obj);
	});
    }

    function sync() {
	// waiting for the agreed-upon time
	while(Date.now() < t0) { };

	if(frame % 60 === 0) {
	    conn.send({ type: "timeSync", time: Date.now(), });
	    secTime = Date.now();
	    timeSet = true;
	}
	if(timeSet && timeRecieved) {
	    timeSet = false;
	    timeRecieved = false;
	    sleep(syncTo - secTime);
	}
    }

    function setFrame() {
	[p1,p2].map(p => {
	    p.stateQueue[frame + delay] = getState(p, frame);
	});

	var frameInput = {
	    left: input.left,
	    right: input.right,
	    up: input.up,
	}
	// scheduling input on both sides
	p1.inputQueue[frame + delay] = frameInput;
	// just sending the objects is inefficient
	// but the sent data is currently absolutely tiny
	conn.send({
	    type: "update",
	    input: frameInput,
	    state: p1.stateQueue[frame],
	    schedFrame: frame + delay,
	});
    }

    function processInput(p) {
	var pInput;
	if(typeof p.inputQueue[frame] == "undefined") {
	    pInput = p.inputQueue[lastGoodFrame];
	} else {
	    pInput = p.inputQueue[frame];
	}
	
	if(pInput.left) p.ax = -0.5;
	else if(pInput.right) p.ax = 0.5;
	else p.ax = 0;
	if(pInput.up && p.onFloor) {
	    p.vy = -20;
	    p.onFloor = false;
	}
    }

    function update() {
	frame++;
	[p1,p2].map(p => doPhysics(p));
	collide();
	render();
	//fixState(p2.inputQueue[frame].state);
	[p1,p2].map(p => processInput(p));
    }

    function gameLoop() {
	if(!ready) conn.send({ type: "timeSetup", time: Date.now() + 2000, });
	if(ready) {
	    update();
	    sync();
	    setFrame();
	}
	window.requestAnimationFrame(gameLoop);
    }
}
