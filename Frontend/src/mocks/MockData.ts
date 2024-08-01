import { Channel } from "../types/channel";
import { User } from "../types/user";

// unix timestamp
export const mockDates = [
	Date.now(),
	// 1999-12-31T23:59:59.999Z
	946684799999,
	// 2000-01-01T00:00:00.000Z
	946684800000,
];

export const mockUsers = [
	new User(1, 'Jeroen', Date.now(), 'green'), 
	new User(2, '1721191---;', mockDates[1], 'yellow'),
	new User(3, 'Charlie', Date.now(), 'blue'),
	new User(4, 'Alice', mockDates[2], 'red')
];

export const mockSocketUsers = [
	{ id: 1, name: 'Jeroen', joined: Date.now(), color: 'green' }, 
	{ id: 2, name: '1721191---;', joined: mockDates[1], color: 'yellow' },
	{ id: 3, name: 'Charlie', joined: Date.now(), color: 'blue' },
	{ id: 4, name: 'Alice', joined: mockDates[2], color: 'red' }
];

export const mockSocketChannels = [
	{ id: 1, name: 'Channel 1', color: 'red', created: Date.now(), password: 'pass1' },
	{ id: 2, name: 'Channel 2', color: 'blue', created: Date.now(), password: 'pass2' }
];

export const mockChannels = [
	new Channel(1, 'Channel 1', 'red', Date.now(), 'pass1'),
	new Channel(2, 'Channel 2', 'blue', Date.now(), 'pass2')
];

export const mockSocketMessages = [
	{
		channel_id: mockChannels[0].id,
		text: 'Hello World!',
		time: Date.now(),
		user_id: 1,
		user: mockSocketUsers[0]
	},
	{
		channel_id: mockChannels[1].id,
		text: 'Goodbye!',
		time: Date.now(),
		user_id: 3,
		user: mockSocketUsers[2]
	}
];

export const mockMessages = [
	{
		channel: mockChannels[0],
		text: 'Hello World!',
		time: Date.now(),
		user: mockUsers[0]
	},
	{
		channel: mockChannels[1],
		text: 'Goodbye!',
		time: Date.now(),
		user: mockUsers[2]
	}
];

