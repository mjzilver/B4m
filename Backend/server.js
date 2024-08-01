const WebSocket = require("ws");
const MemoryStore = require("./data/memoryStore");
const Database = require("./data/database");
const Validator = require("./data/validator");

class WebSocketServer {
	constructor(port) {
		this.port = port;
		this.memoryStore = new MemoryStore();
		this.database = new Database();
		this.validator = new Validator();

		this.server = new WebSocket.Server({ port: this.port }, () => {
			console.log(`WebSocket server is running on ws://localhost:${this.port}`);
		});
		this.setupWebSocket();
	}

	setupWebSocket() {
		this.server.on("connection", (socket) => {
			socket.id = this.generateId();
			socket.on("message", (message) => this.handleMessage(message, socket));
			socket.on("close", () => this.handleClose(socket));
		});
	}

	generateId() {
		return 'id' + (new Date()).getTime() + Math.random().toString(36).slice(2);
	}

	handleMessage(message, socket) {
		try {
			const parsedMessage = JSON.parse(message);
			//console.log(`Parsed message:`, parsedMessage);

			switch (parsedMessage.command) {
			case "broadcast":
				this.broadcastMessage(parsedMessage.message, socket);
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
			case "createChannel":
				this.createChannel(parsedMessage.channel, socket);
				break;
			case "updateChannel":
				this.updateChannel(parsedMessage.channel, socket);	
				break
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
			case "updateUser":
				this.updateUser(parsedMessage.user, socket);
				break
			default:
				console.warn(`Unknown command: ${parsedMessage.command}`);
			}
		} catch (error) {
			console.error("Failed to parse message:", error);
		}
	}

	sendError(socket, error) {
		socket.send(JSON.stringify({ command: "error", error }));
	}

	handleClose(socket) {
		const found = this.memoryStore.getCurrentUser(socket);

		if (found) {
			const user = found.data;
			const channel = this.memoryStore.getChannelByUser(user);

			this.logout(user, channel);
		}
	}

	broadcastMessage(message, socket) {
		const [valid, error] = this.validator.validateMessage(message);

		if(!valid) {
			this.sendError(socket, error);
			return;
		}

		const [canPost, timeoutError] = this.memoryStore.checkMessageTimeout(message, socket);

		if (!canPost) {
			this.sendError(socket, timeoutError);
			return;
		}

		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {

				// turn user object into minimal object
				message.user = {
					id: message.user.id,
					name: message.user.name,
					color: message.user.color
				};

				client.send(JSON.stringify({ command: "broadcast", message }));
			}
		});

		this.database.insertMessage(message);
	}

	getMessages(channelId, socket) {
		this.database.getAllMessages(channelId).then((messages) => {
			for(const m of messages) {
				m.user = {
					id: m.user_id,
					name: m.user_name,
					color: m.user_color
				}
			}

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
			for (const c of channels) {
				c.users = this.memoryStore.getChannelUsers(c);
			}

			socket.send(JSON.stringify({
				command: "channels",
				channels: channels
			}));
		});
	}

	createChannel(channel, socket) {
		const [valid, error] = this.validator.validateChannel(channel);

		if (!valid) {
			this.sendError(socket, error);
			return;
		}

		channel.created = Date.now();

		this.database.tryToCreateChannel(channel).then((row) => {
			if (row) {
				// broadcast new channel to all clients
				this.server.clients.forEach((client) => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(JSON.stringify({ command: "channelCreated", channel: row }));
					}
				});
			} else {
				this.sendError(socket, "Failed to create channel");
			}
		});
	}

	updateChannel(channel, socket) {
		const [valid, error] = this.validator.validateChannel(channel);

		if (!valid) {
			this.sendError(socket, error);
			return;
		}

		this.database.updateChannel(channel).then((row) => {
			if (row) {
				// broadcast new channel to all clients
				this.server.clients.forEach((client) => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(JSON.stringify({ command: "channelUpdated", channel: row }));
					}
				});
			} else {
				this.sendError(socket, "Failed to update channel");
			}
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
		if (!channel) {
			console.warn("Channel not found");
			return;
		}
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
				this.sendError(socket, "Invalid login");
			}
		});
	}

	register(user, socket) {
		const [valid, error] = this.validator.validateUser(user);

		if (!valid) {
			this.sendError(socket, error);
			return;
		}
		
		this.database.checkIfUserExists(user.name).then((row) => {
			if (row) {
				this.sendError(socket, "User already exists");
			} else {
				this.createUser(user, socket);
			}
		});
	}

	updateUser(user, socket) {
		let found = this.memoryStore.getCurrentUser(socket);

		if (!found) {
			this.sendError(socket, "User not found");
			return;
		}

		// check if user is updating their own data
		if (found.data.id !== user.id) {
			this.sendError(socket, "Invalid user data");
			return;
		}

		// you can only change your color not your name/password
		if (found.data.name !== user.name || found.data.password !== user.password) {
			this.sendError(socket, "Invalid change");
			return;
		}

		const [valid, error] = this.validator.validateUser(user);

		if (!valid) {
			this.sendError(socket, error);
			return;
		}

		this.database.updateUser(user).then((row) => {
			if (row) {
				socket.send(JSON.stringify({
					command: "update",
					user: row
				}));
				this.memoryStore.storeUser(row, socket);
			} else {
				this.sendError(socket, "Failed to update user");
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
				this.sendError(socket, "Failed to create user");
			}
		});
	}
}

// Initialize WebSocket server
new WebSocketServer(3000);
