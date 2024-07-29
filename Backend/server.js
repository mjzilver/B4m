const WebSocket = require("ws");
const sqlite3 = require("sqlite3").verbose();
const server = new WebSocket.Server({ port: 3000 });

server.on("connection", (socket) => {
	console.log("Client connected");

	// Handle incoming messages
	socket.on("message", (message) => {
		try {
			const parsedMessage = JSON.parse(message);
			console.log(`Parsed message:`, parsedMessage);

			// Handle different commands
			switch (parsedMessage.command) {
			case "broadcast":
				broadcastMessage(parsedMessage.message);
				break;
			case "getMessages":
				getMessages(parsedMessage.channel.id, socket);
				break;
			case "getChannels":
				getChannels(socket);
				break;
			case "getUsers":
				getUsers(socket);
				break;
			default:
				console.log(`Unknown command: ${parsedMessage.command}`);
			}
		} catch (error) {
			console.error("Failed to parse message:", error);
		}
	});

	socket.on("close", () => {
		console.log("Client disconnected");
	});
});

// Broadcast a message to all connected clients
function broadcastMessage(message) {
	server.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify({ command: "broadcast", message }));
		}
	});


	console.log("Message broadcasted:", message);

	// Save the message to the database
	db.run(
		`INSERT INTO message (user_id, channel_id, message, time) VALUES (?, ?, ?, ?)`,
		[message.user.id, message.channel.id, message.text, message.time],
		(err) => {
			if (err) {
				console.error(err.message);
			}
		}
	);
}

// Get messages from the database and send them to the requesting client
function getMessages(channelId, socket) {
	db.all("SELECT * FROM message WHERE channel_id = ? ORDER BY time DESC LIMIT 100", [channelId], (err, rows) => {
		if (err) {
			console.error(err.message);
			return;
		}

		// Send the messages back to the client
		socket.send(JSON.stringify({
			command: "messages",
			channelId,
			messages: rows
		}));
	});
}

function getChannels(socket) {
	db.all("SELECT * FROM channel", (err, rows) => {
		if (err) {
			console.error(err.message);
			return;
		}

		// Send the messages back to the client
		socket.send(JSON.stringify({
			command: "channels",
			channels: rows
		}));
	});
}


function getUsers(socket) {
	db.all("SELECT * FROM user", (err, rows) => {
		if (err) {
			console.error(err.message);
			return;
		}

		// Send the messages back to the client
		socket.send(JSON.stringify({
			command: "users",
			users: rows
		}));
	});
}

// Initialize SQLite database
let db = new sqlite3.Database("./forum.db", (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log("Connected to the database.");

	// Create tables if not exists
	db.run(
		`CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      joined TEXT NOT NULL,
      color TEXT NOT NULL
    )`
	);
  
	db.run(
		`CREATE TABLE IF NOT EXISTS channel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created TEXT NOT NULL,
      color TEXT NOT NULL,
      password TEXT
    )`
	);
  
	db.run(
		`CREATE TABLE IF NOT EXISTS message (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      channel_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      time TEXT NOT NULL
    )`
	);
});

console.log("WebSocket server is running on ws://localhost:3000");
