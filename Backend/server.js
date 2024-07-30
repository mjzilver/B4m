const WebSocket = require("ws");
const MemoryStore = require("./data/memoryStore");
const Database = require("./data/database");

class WebSocketServer {
	constructor(port) {
		this.port = port;
		this.memoryStore = new MemoryStore();
		this.database = new Database();

		this.server = new WebSocket.Server({ port: this.port }, () => {
			console.log(`WebSocket server is running on ws://localhost:${this.port}`);
		});
		this.setupWebSocket();
	}

	setupWebSocket() {
		this.server.on("connection", (socket) => {
			console.log("Client connected");
			socket.on("message", (message) => this.handleMessage(message, socket));
			socket.on("close", () => this.handleClose(socket));
		});
	}

	handleMessage(message, socket) {
		try {
			const parsedMessage = JSON.parse(message);
			console.log(`Parsed message:`, parsedMessage);

			switch (parsedMessage.command) {
			case "broadcast":
				this.broadcastMessage(parsedMessage.message);
				break;
			case "getMessages":
				this.getMessages(parsedMessage.channel.id, socket);
				break;
			case "getChannels":
				this.getChannels(socket);
				break;
			case "joinChannel":
				this.joinChannel(parsedMessage.channel, parsedMessage.user);
				break;
			case "leaveChannel":
				this.leaveChannel(parsedMessage.channel, parsedMessage.user);
				break;
			case "getUsers":
				this.getUsers(socket);
				break;
			case "loginUser":
				this.login(parsedMessage.user, socket);
				break;
			case "logoutUser":
				this.logout(parsedMessage.user, parsedMessage.channel);
				break;
			case "registerUser":
				this.register(parsedMessage.user, socket);
				break;
			default:
				console.log(`Unknown command: ${parsedMessage.command}`);
			}
		} catch (error) {
			console.error("Failed to parse message:", error);
		}
	}

	handleClose(socket) {
		console.log("Client disconnected");
		const currentUser = this.memoryStore.getCurrentUser(socket);
		if (currentUser) {
			currentUser.channel = null;
			this.logout(currentUser.user, currentUser.channel);
		}
	}

	broadcastMessage(message) {
		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify({ command: "broadcast", message }));
			}
		});
		console.log("Message broadcasted:", message);

		this.database.insertMessage(message);
	}

	getMessages(channelId, socket) {
		this.database.getAllMessages(channelId).then((messages) => {
			socket.send(JSON.stringify({
				command: "messages",
				channelId,
				messages: messages
			}));
		});
	}

	getChannels(socket) {
		this.database.getAllChannels().then((channels) => {
			// Add in-memory users to channels
			channels.forEach((channel) => {
				channel.users = this.memoryStore.getChannelUsers(channel);
			});

			socket.send(JSON.stringify({
				command: "channels",
				channels: channels
			}));
		});
	}

	joinChannel(channel, user) {
		this.memoryStore.addUserToChannel(user, channel);
		channel.users = this.memoryStore.getChannelUsers(channel);

		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify({ command: "userJoinedChannel", channel, user }));
			}
		});
	}

	leaveChannel(channel, user) {
		this.memoryStore.removeUserFromChannel(user);
		channel.users = this.memoryStore.getChannelUsers(channel);

		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify({ command: "userLeftChannel", channel, user }));
			}
		});
	}

	getUsers(socket) {
		this.database.getAllUsers().then((users) => {
			socket.send(JSON.stringify({
				command: "users",
				users: users
			}));
		});
	}

	logout(user, channel) {
		if (channel) this.leaveChannel(channel, user);
		this.memoryStore.removeUser(user);
	}

	login(user, socket) {
		this.database.checkLogin(user.name, user.password).then((row) => {
			if (row) {
				socket.send(JSON.stringify({
					command: "login",
					user: row
				}));
				this.memoryStore.storeUser(row, socket);
			} else {
				socket.send(JSON.stringify({
					command: "login",
					user: null,
					error: "Invalid username or password"
				}));
			}
		});
	}

	register(user, socket) {
		if (!user.name || !user.password) {
			socket.send(JSON.stringify({
				command: "register",
				user: null,
				error: "Invalid username or password"
			}));
			return;
		}
		
		this.database.checkIfUserExists(user.name).then((row) => {
			if (row) {
				socket.send(JSON.stringify({
					command: "register",
					user: null,
					error: "User already exists"
				}));
			} else {
				this.createUser(user, socket);
			}
		});
	}

	createUser(user, socket) {
		this.database.tryToCreateUser(user).then((row) => {
			if (row) {
				socket.send(JSON.stringify({
					command: "register",
					user: row
				}));
				this.memoryStore.storeUser(row, socket);
			} else {
				socket.send(JSON.stringify({
					command: "register",
					user: null,
					error: "Failed to create user"
				}));
			}
		});
	}
}

// Initialize WebSocket server
new WebSocketServer(3000);
