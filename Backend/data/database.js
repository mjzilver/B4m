const sqlite3 = require("sqlite3").verbose();

module.exports = class database {
	constructor() {
		this.db = new sqlite3.Database("./forum.db", (err) => {
			if (err) {
				console.error(err.message);
			}
			console.log("Connected to the database.");
			this.setupDatabase();
		});
	}

	setupDatabase() {
		this.db.run(
			`CREATE TABLE IF NOT EXISTS user (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                password TEXT NOT NULL,
                joined TEXT NOT NULL,
                color TEXT NOT NULL
            )`
		);
		this.db.run(
			`CREATE TABLE IF NOT EXISTS channel (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created TEXT NOT NULL,
                color TEXT NOT NULL,
                password TEXT
            )`
		);
		this.db.run(
			`CREATE TABLE IF NOT EXISTS message (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                channel_id INTEGER NOT NULL,
                text TEXT NOT NULL,
                time TEXT NOT NULL
            )`
		);
	}

	insertMessage(message) {
		this.db.run(
			`INSERT INTO message (user_id, channel_id, text, time) VALUES (?, ?, ?, ?)`,
			[message.user.id, message.channel.id, message.text, message.time],
			(err) => {
				if (err) {
					console.error(err.message);
				}
			}
		);
	}

	async getAllMessages (channelId) {
		return new Promise((resolve, reject) => {
			this.db.all(
				`SELECT message.id, user_id, channel_id, text, user.name AS user_name, user.color AS user_color FROM message
				JOIN user ON message.user_id = user.id
                WHERE channel_id = ?
                ORDER BY message.time ASC
                LIMIT 100`,
				[channelId],
				(err, rows) => {
					if (err) {
						console.error(err.message);
						reject(err);
					}
					resolve(rows);
				}
			);
		});
	}

	async getAllChannels() {
		return new Promise((resolve, reject) => {
			this.db.all(
				`SELECT id, name, created, color FROM channel`,
				(err, rows) => {
					if (err) {
						console.error(err.message);
						reject(err);
					}
					resolve(rows);
				}
			);
		});
	}

	async getAllUsers() {
		return new Promise((resolve, reject) => {
			this.db.all(
				`SELECT id, name, joined, color FROM user`,
				(err, rows) => {
					if (err) {
						console.error(err.message);
						reject(err);
					}
					resolve(rows);
				}
			);
		});
	}

	async checkLogin(name, password) {
		return new Promise((resolve, reject) => {
			this.db.get("SELECT id, name, joined, color FROM user WHERE name = ? AND password = ?", [name, password], (err, row) => {

				if (err) {
					console.error(err.message);
					reject(err);
				}

				if (row) {
					resolve(row);
				} else {
					resolve(null);
				}
			});
		});
	}

	async checkIfUserExists(name) {
		return new Promise((resolve, reject) => {
			this.db.get("SELECT id FROM user WHERE name = ?", [name], (err, row) => {
				if (err) {
					console.error(err.message);
					reject(err);
				}

				if (row) {
					resolve(true);
				} else {
					resolve(false);
				}
			});
		});
	}

	async tryToCreateUser(user) {
		return new Promise((resolve, reject) => {
			this.db.run(
				`INSERT INTO user (name, password, joined, color) VALUES (?, ?, ?, ?)`,
				[user.name, user.password, user.joined, user.color],
				(err) => {
					if (err) {
						console.error(err.message);
						reject(err);
					}

					this.db.get("SELECT id, name, joined, color FROM user WHERE name = ?", [user.name], (err, row) => {
						if (err) {
							console.error(err.message);
							reject(err);
						}

						resolve(row);
					});
				}
			);
		});
	}

	async updateUser(user) {
		return new Promise((resolve, reject) => {
			this.db.run(
				`UPDATE user SET color = ? WHERE id = ?`,
				[user.color, user.id],
				(err) => {
					if (err) {
						console.error(err.message);
						reject(err);
					}

					this.db.get("SELECT id, name, joined, color FROM user WHERE id = ?", [user.id], (err, row) => {
						if (err) {
							console.error(err.message);
							reject(err);
						}

						resolve(row);
					});
				}
			);
		});
	}
}