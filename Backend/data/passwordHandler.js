// class that handles encryption and checking of passwords

const bcrypt = require('bcrypt');

module.exports = class PasswordHandler {
	constructor() { }

	// hash a password
	async hashPassword(password) {
		await bcrypt.genSalt(10);
		return bcrypt.hash(password, 10);
	}

	// check if a password is correct
	async checkPassword(password, hash) {
		return bcrypt.compare(password, hash);
	}
}