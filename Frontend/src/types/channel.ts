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
}

export class NewChannel {
	name: string = 'untitled';
	color: string = 'grey';
	password?: string;
}