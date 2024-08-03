import { TestBed } from '@angular/core/testing';
import { ChannelService } from './channel.service';
import { SocketChannel, SocketResponse, SocketUser } from '../../types/socketMessage';

import { MockDataFactory } from '../../mocks/MockData';

describe('ChannelService', () => {
	let service: ChannelService;

	const mockData = MockDataFactory();

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ChannelService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should parse and emit channels', done => {
		const socketChannels: SocketChannel[] = [
			mockData.mockSocketChannels[0],
			mockData.mockSocketChannels[1]
		];

		service.channels$.subscribe(channels => {
			expect(channels.length).toBe(2);
			expect(channels[0]).toEqual(jasmine.objectContaining(mockData.mockChannels[0]));
			expect(channels[1]).toEqual(jasmine.objectContaining(mockData.mockChannels[1]));
			done();
		});

		const parsedChannels = service.parseChannels(socketChannels);
		expect(parsedChannels.length).toBe(2);
	});

	it('should update channel users', () => {
		const testUser1: SocketUser = mockData.mockSocketUsers[0];
		const testUser2: SocketUser = mockData.mockSocketUsers[1];

		const socketUsers: SocketUser[] = [
			testUser1, testUser2
		];

		const socketChannels: SocketChannel[] = [
			mockData.mockSocketChannels[0]
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
			mockData.mockSocketChannels[0],
			mockData.mockSocketChannels[1]
		];

		service.parseChannels(socketChannels);
		const channels = service.getChannels();

		expect(channels.length).toBe(2);
		expect(channels[0]).toEqual(jasmine.objectContaining(mockData.mockChannels[0]));
		expect(channels[1]).toEqual(jasmine.objectContaining(mockData.mockChannels[1]));
	});
});
