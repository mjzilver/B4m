module.exports = class MemoryStore {
	constructor() {
		this.users = [];
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