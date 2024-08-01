import { TestBed } from '@angular/core/testing';
import { ChannelService } from './channel.service';
import { SocketChannel, SocketResponse, SocketUser } from '../../types/socketMessage';

import { mockChannels, mockSocketChannels, mockSocketUsers } from '../../mocks/MockData';

describe('ChannelService', () => {
	let service: ChannelService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ChannelService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should parse and emit channels', done => {
		const socketChannels: SocketChannel[] = [
			mockSocketChannels[0],
			mockSocketChannels[1]
		];

		service.channels$.subscribe(channels => {
			expect(channels.length).toBe(2);
			expect(channels[0]).toEqual(jasmine.objectContaining(mockChannels[0]));
			expect(channels[1]).toEqual(jasmine.objectContaining(mockChannels[1]));
			done();
		});

		const parsedChannels = service.parseChannels(socketChannels);
		expect(parsedChannels.length).toBe(2);
	});

	it('should update channel users', () => {
		const testUser1: SocketUser = mockSocketUsers[0];
		const testUser2: SocketUser = mockSocketUsers[1];

		const socketUsers: SocketUser[] = [
			testUser1, testUser2
		];

		const socketChannels: SocketChannel[] = [
			mockSocketChannels[0]
		];
		socketChannels[0].users = socketUsers;

		service.parseChannels(socketChannels);

		const socketResponse: SocketResponse = {
			command: 'channels',
			channel: socketChannels[0]
		};

		service.updateChannelUsers(socketResponse);

		const channels = service.getChannels();
		expect(channels[0].users.length).toBe(2);
		expect(channels[0].users[0]).toEqual(jasmine.objectContaining(testUser1));
		expect(channels[0].users[1]).toEqual(jasmine.objectContaining(testUser2));
	});

	it('should return channels', () => {
		const socketChannels: SocketChannel[] = [
			mockSocketChannels[0],
			mockSocketChannels[1]
		];

		service.parseChannels(socketChannels);
		const channels = service.getChannels();

		expect(channels.length).toBe(2);
		expect(channels[0]).toEqual(jasmine.objectContaining(mockChannels[0]));
		expect(channels[1]).toEqual(jasmine.objectContaining(mockChannels[1]));
	});
});
