module.exports = class MemoryStore {
	constructor() {
		this.users = [];
		this.channels = [];
	}

	getChannelUsers(channel) {
		return this.channels.find((c) => c.id === channel?.id)?.users;
	}

	getChannelById(id) {
		return this.channels.find((channel) => channel.id === id);
	}

	addUserToChannel(user, channel) {
		var found = this.getChannelById(channel.id)
		
		if(found) {
			found.users.push(user);
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
			let found = channel.users.find((u) => u.id === user.id);
			if (found) {
				channel.users.splice(channel.users.indexOf(found), 1);
			}
		});
	}

	getUserById(id) {
		return this.users.find((user) => user.data.id === id);
	}

	storeUser(user, socket) {
		this.users.push({
			data: user,
			socket: socket
		});
	}

	removeUser(user) {
		if (!user) return;

		let currentUser = this.getUserById(user.id);
		if (currentUser) {
			this.users.splice(this.users.indexOf(currentUser), 1);
		}
	}

	getCurrentUser(socket) {
		return this.users.find((user) => user.socket === socket);
	}
};