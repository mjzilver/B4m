import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { User } from '../../types/user';
import { By } from '@angular/platform-browser';

describe('UserListComponent', () => {
	let component: UserListComponent;
	let fixture: ComponentFixture<UserListComponent>;

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
		const users: User[] = [
			{ id: 1, name: 'User1', color: 'red', joined: Date.now() },
			{ id: 2, name: 'User2', color: 'blue', joined: Date.now() }
		];
		component.users = users;
		fixture.detectChanges();

		const userListMessage = fixture.debugElement.query(By.css('p'));
		const userItems = fixture.debugElement.queryAll(By.css('li'));

		expect(userListMessage).toBeTruthy();
		expect(userListMessage.nativeElement.textContent).toContain('Users connected to chosen channel:');
		expect(userItems.length).toBe(2);
		expect(userItems[0].nativeElement.textContent).toContain('User1');
		expect(userItems[1].nativeElement.textContent).toContain('User2');
	});

	it('should not display users list when users array is empty', () => {
		component.users = [];
		fixture.detectChanges();

		const userListMessage = fixture.debugElement.query(By.css('p'));
		const userItems = fixture.debugElement.queryAll(By.css('li'));

		expect(userListMessage).toBeNull();
		expect(userItems.length).toBe(0);
	});
});
