import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { UserProfileComponent } from './user-profile.component';
import { WebsocketService } from '../websocket-service/websocket.service';
import { User } from '../../types/user';

import { MockWebsocketService } from '../../mocks/MockWebSocketService';

describe('UserProfileComponent', () => {
	let component: UserProfileComponent;
	let fixture: ComponentFixture<UserProfileComponent>;
	let websocketService: WebsocketService;
	let updateUserSpy: jasmine.Spy;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [FormsModule],
			declarations: [UserProfileComponent],
			providers: [
				{ provide: WebsocketService, useClass: MockWebsocketService }
			]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UserProfileComponent);
		component = fixture.componentInstance;
		websocketService = TestBed.inject(WebsocketService);
		updateUserSpy = spyOn(websocketService, 'updateUser');
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should open the modal when openModal is called', () => {
		component.openModal();
		expect(component.showModal).toBeTrue();
	});

	it('should close the modal when closeModal is called', () => {
		component.showModal = true;
		component.closeModal();
		expect(component.showModal).toBeFalse();
	});

	it('should call updateUser and closeModal on form submit', () => {
		const user: User = new User(1, 'testuser', Date.now(), 'blue');
		component.user = user;
		component.showModal = true;
		fixture.detectChanges();

		const form: DebugElement = fixture.debugElement.query(By.css('form'));
		form.triggerEventHandler('ngSubmit', null);

		expect(updateUserSpy).toHaveBeenCalledWith(user);
		expect(component.showModal).toBeFalse();
	});

	it('should not call updateUser on form submit if color has not changed', () => {
		const user: User = new User(1, 'testuser', Date.now(), 'blue');
		component.user = user;
		component.oldColor = 'blue';
		component.showModal = true;
		fixture.detectChanges();
    
		const form: DebugElement = fixture.debugElement.query(By.css('form'));
		form.triggerEventHandler('ngSubmit', null);
    
		expect(updateUserSpy).not.toHaveBeenCalled();
		expect(component.showModal).toBeFalse();
	});
});
