module.exports = class MemoryStore {
	constructor() {
		// user format: {data: user, socketId: socket.id, lastMessageTime: message.time}
		this.users = [];
		// channel format: {id: channel.id, users: [user]}
		this.channels = [];
	}

	getChannelUsers(channel) {
		return this.channels.find((c) => c.id === channel?.id)?.users;
	}

	getChannelById(id) {
		return this.channels.find((channel) => channel.id === id);
	}

	getChannelByUser(user) {
		for (const channel of this.channels) {
			for (const u of channel.users) {
				if (u.id === user.id) {
					return channel;
				}
			}
		}
		return null;
	}

	removeChannel(channel) {
		let foundChannel = this.getChannelById(channel.id);
		if (foundChannel) {
			this.channels.splice(this.channels.indexOf(foundChannel), 1);
		}
	}

	addUserToChannel(user, channel) {
		var foundChannel = this.getChannelById(channel.id)
		
		if(foundChannel) {
			if (foundChannel.users.find((u) => u.id === user.id)) return;
			foundChannel.users.push(user);
			return;
		} else {
			// if not found add new channel
			this.channels.push({
				id: channel.id,
				users: [user]
			});
		}
	}

	removeUserFromChannel(user) {
		this.channels.forEach((channel) => {
			let found = channel.users.find((u) => u.id === user?.id);
			if (found) {
				channel.users.splice(channel.users.indexOf(found), 1);
			}
		});
	}

	getUserById(id) {
		return this.users.find((user) => user.data.id === id);
	}

	storeUser(user, socket) {
		var foundUser = this.getUserById(user.id);

		if (foundUser) {
			foundUser.socketId = socket.id;
			foundUser.data = user;
			return;
		} else {
			this.users.push({
				data: user,
				socketId: socket.id
			});
		}
	}

	removeUser(user) {
		if (!user) return;

		let currentUser = this.getUserById(user.id);
		if (currentUser) {
			this.users.splice(this.users.indexOf(currentUser), 1);
		}
	}

	getCurrentUser(socket) {
		return this.users.find((user) => user.socketId === socket.id);
	}

	checkMessageTimeout(message, socket) {
		const user = this.getCurrentUser(socket);
		if(!user) {
			return [false, "User not found"];
		}

		// first message
		if(user.lastMessageTime === undefined) {
			user.lastMessageTime = message.time;
			return [true, null];
		}

		// cant send messages too fast (1 message per 2 seconds)
		if (message.time - user.lastMessageTime < 2000) {
			const secondsRoundedUp = Math.ceil((2000 - (message.time - user.lastMessageTime)) / 1000);
			return [false , `Sending messages too fast, wait ${secondsRoundedUp} seconds`];
		}
		user.lastMessageTime = message.time;
		return [true, null];
	}
};