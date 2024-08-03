import { User } from './user';
import { Message } from './message';

export class Channel {
	id: number;
	name: string;
	users: User[] = [];
	messages: Message[] = [];
	password?: string;
	created: number;
	color: string;
	ownerId?: number;

	constructor(
		id: number,
		name: string,
		color: string,
		created: number = Date.now(),
		ownerId?: number,
		password?: string
	) {
		this.id = id;
		this.name = name;
		this.created = created;
		this.color = color;
		this.id = id;
		this.ownerId = ownerId;
		this.password = password;
	}

	getSerialized() {
		return {
			id: this.id,
			name: this.name,
			users: this.users.map(user => user.getSerialized()),
			messages: this.messages.map(message => message.getSerialized()),
			password: this.password,
			created: this.created,
			color: this.color,
			ownerId: this.ownerId
		};
	}
	
	toDTO() {
		return new Channel(this.id, this.name, this.color, this.created, this.ownerId, this.password);
	}
}

export class MinChannel {
	id: number;
	name: string;
	created: number;
	color: string;
	ownerId?: number;

	constructor(
		id: number,
		name: string,
		color: string,
		created: number = Date.now(),
		ownerId?: number,
	) {
		this.id = id;
		this.name = name;
		this.created = created;
		this.color = color;
		this.id = id;
		this.ownerId = ownerId;
	}
}

export class NewChannel {
	name: string = 'untitled';
	color: string = 'grey';
	password?: string;
}