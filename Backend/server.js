const WebSocket = require("ws");
const sqlite3 = require("sqlite3").verbose();
const server = new WebSocket.Server({ port: 3000 });

// *** WebSocket server ***
// soon will be replaced with Dotnet :) 

const memoryStore = {
	users: []
};

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
			case "joinChannel":
				joinChannel(parsedMessage.channel, parsedMessage.user);
				break;
			case "leaveChannel":
				leaveChannel(parsedMessage.channel, parsedMessage.user);
				break;
			case "getUsers":
				getUsers(socket);
				break;
			case "loginUser":
				login(parsedMessage.user, socket);
				break;
			case "logoutUser":
				logout(parsedMessage.user, parsedMessage.channel);
				break;
			case "registerUser":
				register(parsedMessage.user, socket);
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

		let currentUser = getCurrentUser(socket);

		if (currentUser) {
			logout(currentUser.user, currentUser.channel);
		}

		// Close the connection
		socket.close();
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
		`INSERT INTO message (user_id, channel_id, text, time) VALUES (?, ?, ?, ?)`,
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
	db.all("SELECT * FROM message WHERE channel_id = ? ORDER BY time ASC LIMIT 100", [channelId], (err, rows) => {
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
	db.all("SELECT id, name, created, color FROM channel", (err, rows) => {
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

function getChannelUsers(channel) {
	console.log("Getting users for channel", channel);
	console.log("Memory store", memoryStore.users);
	let users = memoryStore.users.filter((user) => user.channel && user.channel.id === channel.id);
	return users.map((user) => user.data);
}

function setUserChannel(user, channel) {
	let currentUser = getCurrentUser(user);
	if (currentUser) {
		currentUser.channel = channel;
	}

	memoryStore.users.forEach((u) => {
		if (u.data.id === user.id) {
			u.channel = channel;
		}
	});
}

function joinChannel(channel, user) {
	setUserChannel(user, channel);

	channel.users = getChannelUsers(channel);

	// broadcast to all clients that user joined the channel
	server.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify({ command: "userJoinedChannel", channel, user }));
		}
	});
}

function leaveChannel(channel, user) {
	setUserChannel(user, null);

	channel.users = getChannelUsers(channel);

	console.log("Channel users", channel.users);

	// broadcast to all clients that user left the channel
	server.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify({ command: "userLeftChannel", channel, user }));
		}
	});
}

function getUsers(socket) {
	// get all users from database
	db.all("SELECT id, name, joined, color FROM user", (err, rows) => {
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

function logout(user, channel) {
	if (channel)
		leaveChannel(channel, user);
	// remove user from memoryStore
	removeUser(user);
}


function login(user, socket) {
	db.get("SELECT id, name, joined, color FROM user WHERE name = ? AND password = ?", [user.name, user.password], (err, row) => {
		if (err) {
			console.error(err.message);
			return;
		}

		if (row) {
			socket.send(JSON.stringify({
				command: "login",
				user: row
			}));

			storeUser(row, socket);
		} else {
			socket.send(JSON.stringify({
				command: "login",
				user: null,
				error: "Invalid username or password"
			}));
		}
	});
}

function register(user, socket) {
	if (!user.name || !user.password) {
		socket.send(JSON.stringify({
			command: "register",
			user: null,
			error: "Invalid username or password"
		}));
		return;
	}
	// Check if the user already exists
	db.get("SELECT * FROM user WHERE name = ?", [user.name], (err, row) => {
		if (err) {
			console.error(err.message);
			return;
		}

		if (row) {
			socket.send(JSON.stringify({
				command: "register",
				user: null,
				error: "User already exists"
			}));
		} else {
			createUser(user, socket);
		}
	});
}

function createUser(user, socket) {
	db.run(
		`INSERT INTO user (name, password, joined, color) VALUES (?, ?, ?, ?)`,
		[user.name, user.password, user.joined, user.color],
		(err) => {
			if (err) {
				console.error(err.message);
				socket.send(JSON.stringify({
					command: "register",
					user: null,
					erorr: "Failed to create user"
				}));
				return;
			}

			db.get("SELECT id, name, joined, color FROM user WHERE name = ?", [user.name], (err, row) => {
				if (err) {
					console.error(err.message);
					return;
				}

				socket.send(JSON.stringify({
					command: "register",
					user: row
				}));

				storeUser(row, socket);
			});
		}
	);
}

function storeUser(user, socket) {
	memoryStore.users.push({
		data: user,
		socket: socket
	});
}

function removeUser(user) {
	if(!user) return;

	let currentUser = memoryStore.users.find((u) => u.data.id === user.id);
	if (currentUser) {
		memoryStore.users.splice(memoryStore.users.indexOf(currentUser), 1);
	}
}

// returns the stored user object for the given socket
function getCurrentUser(socket) {
	return memoryStore.users.find((user) => user.socket === socket);
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
      text TEXT NOT NULL,
      time TEXT NOT NULL
    )`
	);
});


console.log("WebSocket server is running on ws://localhost:3000");
