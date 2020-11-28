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

user.on("open", (id) => {
    let idText = "Your ID: " + id;
    peerIdSpace.innerHTML = idText;
    // there are better ways to do this, but none that indent correctly in my editor that I know of
    inputId.innerHTML = [
	'Input an ID:',
    	'<div class="input-group mb-3">',
	'<div class="input-group-prepend" id="messages">',
	'<button  type="button" class="btn btn-secondary" onclick="connect()">Connect</button>',
	'</div>',	
	'<input type="text" class="form-control" id="idBox" placeholder="Enter a friend\'s ID to connect!">',
	'</div>',	
	'Alternatively, wait for a connection!',
    ].join("");
});

function connect() {
    conn = user.connect(document.getElementById("idBox").value);
    begin();
}

user.on("connection", (recievedConn) => {
    conn = recievedConn;
    begin();
});

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
    let input = [
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
    app.innerHTML = input;
    conn.on("data", (data) => {
	addMsg(data);
    });
}


