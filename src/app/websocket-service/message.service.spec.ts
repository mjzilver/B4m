import { TestBed } from '@angular/core/testing';
import { MessageService } from './message.service';
import { Channel } from '../../types/channel';
import { SocketMessage } from '../../types/socketMessage';
import { MockDataFactory } from '../../mocks/MockData';

describe('MessageService', () => {
	let service: MessageService;

	const mockData = MockDataFactory();

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(MessageService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should warn when user or channel is not found', () => {
		const consoleWarnSpy = spyOn(console, 'warn');

		const channels: Channel[] = [mockData.mockChannels[0]];
		const mockUser1 = mockData.mockUsers[0];
		const mockUser2 = mockData.mockUsers[1];

		const socketMessages: SocketMessage[] = [
			{
				channelId: channels[0].id,
				text: 'Hello World!',
				time: Date.now(),
				userId: 33333, // invalid user
				user: mockUser1
			},
			{
				channelId: 99, // invalid channel
				text: 'Goodbye!',
				time: Date.now(),
				userId: mockUser2.id,
				user: mockUser2
			}
		];

		service.parseMessages(socketMessages, channels);

		expect(consoleWarnSpy).toHaveBeenCalledWith('User or Channel not found for message', socketMessages[1]);
	});

	it('should warn if user or channel is missing in parseMessage', () => {
		const consoleWarnSpy = spyOn(console, 'warn');

		const socketMessage: SocketMessage = {
			text: 'Hello World!',
			time: Date.now(),
			userId: 0,
			channelId: 0, // invalid channel
			user: mockData.mockUsers[0]
		};

		service.parseMessage(socketMessage, mockData.mockChannels);

		expect(consoleWarnSpy).toHaveBeenCalledWith('User or Channel not found for message', socketMessage);
	});

	it('should parse and return a message correctly', () => {
		const result = service.parseMessage(mockData.mockSocketMessages[0], mockData.mockChannels);

		expect(result.channel.id).toEqual(mockData.mockMessages[0].channel.id);
		expect(result.text).toEqual(mockData.mockMessages[0].text);
		expect(result.time).toEqual(mockData.mockMessages[0].time);
		expect(result.user.id).toEqual(mockData.mockMessages[0].user.id);
	});
});

