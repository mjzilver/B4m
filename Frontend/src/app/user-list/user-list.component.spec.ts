import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { By } from '@angular/platform-browser';
import { MockDataFactory } from '../../mocks/MockData';

describe('UserListComponent', () => {
	let component: UserListComponent;
	let fixture: ComponentFixture<UserListComponent>;
	const mockData = MockDataFactory();

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ UserListComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UserListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display users list when users are present', () => {
		const users = mockData.mockUsers;
		component.users = users;
		fixture.detectChanges();

		const userItems = fixture.debugElement.queryAll(By.css('.user-list-item'));

		expect(userItems.length).toBe(mockData.mockUsers.length);
		expect(userItems[0].nativeElement.textContent).toContain(mockData.mockUsers[0].name);
		expect(userItems[1].nativeElement.textContent).toContain(mockData.mockUsers[1].name);
	});

	it('should not display users list when users array is empty', () => {
		component.users = [];
		fixture.detectChanges();

		const userListMessage = fixture.debugElement.query(By.css('.user-list-message'));
		const userItems = fixture.debugElement.queryAll(By.css('.user-list-item'));

		expect(userListMessage).toBeNull();
		expect(userItems.length).toBe(0);
	});
});
