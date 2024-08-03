import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { MockDataFactory } from '../../mocks/MockData';

describe('UserService', () => {
	let service: UserService;

	const mockData = MockDataFactory();

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(UserService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should parse and return users correctly', () => {
		const result = service.parseUsers(mockData.mockSocketUsers);
		expect(result).toEqual(mockData.mockUsers);
	});

	it('should set the current user correctly on handleLogin', () => {
		const socketUser = mockData.mockSocketUsers[0];

		service.currentUser$.subscribe(user => {
			expect(user).toEqual(mockData.mockUsers[0]);
		});

		service.handleLogin(socketUser);
	});

	it('should emit users correctly when parseUsers is called', (done) => {
		const socketUsers = mockData.mockSocketUsers;

		const expectedUsers = mockData.mockUsers;

		service.users$.subscribe(users => {
			expect(users).toEqual(expectedUsers);
			done();
		});

		service.parseUsers(socketUsers);
	});
});
