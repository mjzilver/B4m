export class User {
	id: number;
	name: string;
	password?: string;
	joined: number;
	color: string;

	constructor(
		id: number,
		name: string,
		joined: number,
		color: string
	) {
		this.id = id;
		this.name = name;
		this.joined = joined;
		this.color = color;
	}
}

export class UserLogin {
	name: string;
	password: string;
	existingUser: boolean;
	joined: number;
	color: string;

	constructor(name: string, password: string) {
		this.name = name;
		this.password = password;
		this.existingUser = true;
		this.joined = Date.now();
		this.color = 'grey';
	}
}

// minimal user object for messages
export class MessageUser {
	id: number;
	name: string;
	color: string;

	constructor(id: number, name: string, color: string) {
		this.id = id;
		this.name = name;
		this.color = color;
	}
}
