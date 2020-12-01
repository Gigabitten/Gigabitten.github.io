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
    conn = user.connect(document.getElementById("idBox").value, { reliable: true, });
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
    // there are better ways to do this, but none that indent correctly in my editor that I know of
    inputId.innerHTML = [
	'Input an ID:',
    	'<div class="input-group mb-3">',
	'<div class="input-group-prepend" id="messages">',
	'<button  type="button" class="btn btn-secondary" id="connectBtn">Connect</button>',
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

function coordinateTime() {
    
}

function begin() {
    app.innerHTML = "";
    coordinateTime();
    run();
}

function run() {
    var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	transparent: true,
	physics: {
	    default: 'arcade',
	    arcade: {
		gravity: { y: 2000 },
		debug: false,
	    }
	},
	scene: {
	    preload: preload,
	    create: create,
	    update: update,
	}
    };

    var game = new Phaser.Game(config);
    var cursors;
    var p1;
    var p2;
    var p2Queue = new Array();
    var frame = 0;
    var t0;
    var syncTo;
    var timeRecieved = false;
    var secTime;
    var timeSet = false;
    

    function preload() { }

    function create() {
	var floor = this.add.rectangle(400, 550, 500, 100, 0xeeeeee);
	this.physics.add.existing(floor, true);
	
	p1 = this.add.circle(150, 100, 20, 0x00ff00);
	this.physics.add.existing(p1);
	p1.body.setBounce(0.2);
	p2 = this.add.circle(650, 100, 20, 0xff0000);
	this.physics.add.existing(p2);
	p2.body.setBounce(0.2);
	
	this.physics.add.collider(floor, p1);
	this.physics.add.collider(floor, p2);

	cursors = this.input.keyboard.createCursorKeys();

	if(host) {
	    t0 = Date.now() + 2000;
	    conn.send({ type: "timeSetup", t0: t0, });
	} else {
	    var temp = p1;
	    p1 = p2;
	    p2 = temp;	    
	}
	
	conn.on("data", (data) => {
	    // string comparison is slightly slow, I know, but this is *very* easy to read
	    if(data.type === "timeSetup") {
		t0 = data.t0;
	    }
	    if(data.type === "timeSync") {
		syncTo = data.time;
		timeRecieved = true;
	    }
	    if(data.type === "update") {
		p2Queue.push(data);
	    }
	});
    }

    function fixState(state) {
	p2.x = state.x;
	p2.y = state.y;
	p2.body.setVelocityX(state.xv);
	p2.body.setVelocityY(state.yv);
    }

    function update() {
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
	    let t = Date.now();
	    while(Date.now() < t + (syncTo - secTime)) { }
	}
	
	frame++;
	var frameInput = {
	    left: cursors.left.isDown,
	    right: cursors.right.isDown,
	    up: cursors.up.isDown
	};
	var frameState = {
	    x: p1.x,
	    y: p1.y,
	    xv: p1.body.velocity.x,
	    yv: p1.body.velocity.y,
	};
	
	// just sending the objects is inefficient but the sent data is absolutely tiny
	conn.send({ type: "update", input: frameInput, state: frameState, });

	if(p2Queue.length < 2 && frame > 100) console.log("Ran out of input from remote player");
	
	if(p1.y > 600) {
	    if(host) {
		p1.x = 150;
		p1.y = 100;
	    } else {
		p1.x = 650;
		p1.y = 100;
	    }
	    p1.body.setVelocityX(0);
	    p1.body.setVelocityY(0);	    
	}
	if(p2.y > 600) {
	    if(host) {
		p2.x = 650;
		p2.y = 100;
	    } else {
		p2.x = 150;
		p2.y = 100;
	    }
	    p2.body.setVelocityX(0);
	    p2.body.setVelocityY(0);
	}
	
	if(p1.body.touching.down) p1.body.setVelocityX(p1.body.velocity.x * 0.99);
	if(p2.body.touching.down) p2.body.setVelocityX(p2.body.velocity.x * 0.99);

	var xMax = 750;
	var yMax = 1000;
	if(p2Queue.length > 2) {
	    fixState(p2Queue[0].state);
	    console.log(`p2Queue length: ${p2Queue.length}`);
	    if(frames % 60 === 0) console.log(`Seconds passed: ${Math.floor(frames / 60)}`);

	    if(cursors.left.isDown && p1.body.velocity.x < xMax) p1.body.setAccelerationX(-1000);
	    else if(cursors.right.isDown&& p1.body.velocity.y < yMax) p1.body.setAccelerationX(1000);
	    else p1.body.setAccelerationX(0);
	    if(cursors.up.isDown && p1.body.touching.down) p1.body.setVelocityY(-1000);

	    var p2Input = p2Queue[0].input;
	    if(p2Input.left && p2.body.velocity.x < xMax) p2.body.setAccelerationX(-1000);
	    else if(p2Input.right && p2.body.velocity.y < yMax) p2.body.setAccelerationX(1000);
	    else p2.body.setAccelerationX(0);
	    if(p2Input.up && p2.body.touching.down) p2.body.setVelocityY(-1000);

	    p2Queue.shift();
	}

	// custom collision checking because the basic check is weird with shapes and it's easyish
	var xDist = p1.x - p2.x;
	var yDist = p1.y - p2.y;
	var dist = Math.sqrt(xDist * xDist + yDist * yDist);
	var outerDist = dist - p1.width - p2.width;
	if(outerDist < 0) {
	    // static collision resolution
	    p1.x -= (outerDist / 2) * (p1.x - p2.x) / dist;
	    p1.y -= (outerDist / 2) * (p1.y - p2.y) / dist;
	    p2.x += (outerDist / 2) * (p1.x - p2.x) / dist;
	    p2.y += (outerDist / 2) * (p1.y - p2.y) / dist;

	    // dynamic collision resolution - formula off of wikipedia page for elastic collisions
	    var nx = xDist / dist;
	    var ny = yDist / dist;

	    var kx = p1.body.velocity.x - p2.body.velocity.x;
	    var ky = p1.body.velocity.y - p2.body.velocity.y;
	    
	    var p = nx * kx + ny * ky;
	    
	    p1.body.setVelocityX(p1.body.velocity.x - p * nx);
	    p1.body.setVelocityY(p1.body.velocity.y - p * ny);
	    p2.body.setVelocityX(p2.body.velocity.x + p * nx);
	    p2.body.setVelocityY(p2.body.velocity.y + p * ny);
	}
    }
}

// The following section of code was mostly for my own sake, to make sure I understand
/*
function addMsg(msg) {
    let messages = document.getElementById("messages");
    messages.innerHTML = messages.innerHTML + '<br>\u2003\u2003\u2003\u2003\u00A0\u00A0\u00A0' + msg;
}

function sendMsg() {
    let messageBox = document.getElementById("messageBox");
    conn.send(messageBox.value);
    addMsg(messageBox.value);
    messageBox.value = "";
}

function begin() {
    app.innerHTML = [
	'<div class="fixed-bottom">',
	'<div id="messages"></div>',
	'<div class="input-group mb-3">',
	'<div class="input-group-prepend">',	
	'<button type="button" class="btn btn-secondary" onclick="sendMsg()">Send</button>',
	'</div>',	
	'<input type="text" class="form-control" id="messageBox" placeholder="Send a message">',
	'</div>',
	'</div>',	
    ].join("");
    document.getElementById("messageBox").addEventListener("keypress", (event) => {
	checkEnter(event, sendMsg);
    });    
    conn.on("data", (data) => {
	addMsg(data);
    });
}
*/
