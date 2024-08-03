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

	getSerialized() {
		return {
			id: this.id,
			name: this.name,
			joined: this.joined,
			color: this.color
		};
	}
}

export class UserLogin {
	name: string;
	password: string;
	existingUser: boolean;
	joined: number;
	color: string;

	constructor(name: string, password: string, existingUser: boolean = true) {
		this.name = name;
		this.password = password;
		this.existingUser = existingUser;
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

	getSerialized() {	
		return {
			id: this.id,
			name: this.name,
			color: this.color
		};
	}
}
