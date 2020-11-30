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

function connect() {
    conn = user.connect(document.getElementById("idBox").value);
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
    begin();
});

function begin() {
    app.innerHTML = "";
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
    var p2Input = new Input(false, false, false);

    function preload() {

    }

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
	
	conn.on("data", (data) => {
	    p2Input = data;
	});
    }

    function update() {
	// catastrophically hacky
	conn.send(new Input(cursors.right.isDown, cursors.left.isDown, cursors.up.isDown));
	
	if(p1.y > 600) {
	    p1.x = 150;
	    p1.y = 100;
	    p1.body.setVelocityX(0);
	    p1.body.setVelocityY(0);
	}
	if(p2.y > 600) {
	    p2.x = 650;
	    p2.y = 100;
	    p2.body.setVelocityX(0);
	    p2.body.setVelocityY(0);
	}
	
	if(p1.body.touching.down) p1.body.setVelocityX(p1.body.velocity.x * 0.99);
	if(p2.body.touching.down) p2.body.setVelocityX(p2.body.velocity.x * 0.99);

	var xMax = 750;
	var yMax = 1000;
	
	if (cursors.left.isDown && p1.body.velocity.x < xMax) p1.body.setAccelerationX(-1000);
	else if (cursors.right.isDown&& p1.body.velocity.y < yMax) p1.body.setAccelerationX(1000);
	else p1.body.setAccelerationX(0);
	if (cursors.up.isDown && p1.body.touching.down) p1.body.setVelocityY(-1000);

	if (p2Input.left && p2.body.velocity.x < xMax) p2.body.setAccelerationX(-1000);
	else if (p2Input.right && p2.body.velocity.y < yMax) p2.body.setAccelerationX(1000);
	else p2.body.setAccelerationX(0);
	if (p2Input.up && p2.body.touching.down) p2.body.setVelocityY(-1000);	

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


class Input {
    constructor(l, r, u) {
	this.left = l;
	this.right = r;
	this.up = u;
    }
};

function sendInput() {
    
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
