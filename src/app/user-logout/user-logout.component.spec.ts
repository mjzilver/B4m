import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserLogoutComponent } from './user-logout.component';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('UserLogoutComponent', () => {
	let component: UserLogoutComponent;
	let fixture: ComponentFixture<UserLogoutComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [UserLogoutComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UserLogoutComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should emit logout event when logout button is clicked', () => {
		spyOn(component.logout, 'emit');

		const logoutButton: DebugElement = fixture.debugElement.query(By.css('.button-logout'));
		logoutButton.triggerEventHandler('click', null);

		expect(component.logout.emit).toHaveBeenCalled();
	});
});
