import { TestBed } from '@angular/core/testing';
import { MessageService } from './message.service';
import { Message } from '../../types/message';
import { Channel } from '../../types/channel';
import { MessageUser } from '../../types/user';
import { SocketMessage } from '../../types/socketMessage';
import { mockChannels } from '../../mocks/MockData';

import { mockSocketMessages } from '../../mocks/MockData';

describe('MessageService', () => {
	let service: MessageService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(MessageService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should warn when user or channel is not found', () => {
		const consoleWarnSpy = spyOn(console, 'warn');

		const channels: Channel[] = [mockChannels[0]];
		const socketMessages = mockSocketMessages;

		service.parseMessages(socketMessages, channels);

		expect(consoleWarnSpy).toHaveBeenCalledWith('User or Channel not found for message', socketMessages[1]);
	});

	it('should warn if user or channel is missing in parseMessage', () => {
		const consoleWarnSpy = spyOn(console, 'warn');

		const channels: Channel[] = [new Channel(1, 'General', 'red')];


		const socketMessage: SocketMessage = {
			text: 'Hello World!',
			time: Date.now(),
			user_id: 0,
			channel_id: 0,
			channel: { id: 0, name: 'General', color: 'red', created: Date.now() },
			user: { id: 0, name: 'Alice', color: 'red', joined: Date.now() }
		};

		service.parseMessage(socketMessage, channels);

		expect(consoleWarnSpy).toHaveBeenCalledWith('User or Channel not found for message', socketMessage);
	});

	it('should parse and return a message correctly', () => {
		const channels: Channel[] = [new Channel(1, 'General', 'red')];

		const socketMessage: SocketMessage = {
			text: 'Hello World!',
			time: Date.now(),
			user_id: 1,
			user: { id: 1, name: 'Alice', color: 'red', joined: Date.now() },
			channel_id: 1,
			channel: { id: 1, name: 'General', color: 'red', created: Date.now() }
		};

		const expectedMessage = new Message(
			new MessageUser(1, 'Alice', 'red'),
			'Hello World!',
			socketMessage.time,
			channels[0]
		);

		const result = service.parseMessage(socketMessage, channels);
		expect(result).toEqual(expectedMessage);
	});
});

