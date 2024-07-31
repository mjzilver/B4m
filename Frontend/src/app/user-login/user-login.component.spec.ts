import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { UserLoginComponent } from './user-login.component';
import { AuthService } from '../services/auth.service';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MockAuthService } from '../../mocks/MockAuthService';
import { UserLogin } from '../../types/user';

describe('UserLoginComponent', () => {
	let component: UserLoginComponent;
	let fixture: ComponentFixture<UserLoginComponent>;
	let authService: AuthService;
	let loginSpy: jasmine.Spy;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [FormsModule],
			declarations: [UserLoginComponent],
			providers: [
				{ provide: AuthService, useClass: MockAuthService }
			]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UserLoginComponent);
		component = fixture.componentInstance;
		authService = TestBed.inject(AuthService);
		loginSpy = spyOn(authService, 'login');
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call authService.login with existingUser true on form submit', () => {
		component.newUser = new UserLogin('testuser', 'password');

		const form: DebugElement = fixture.debugElement.query(By.css('form'));
		form.triggerEventHandler('submit', null);

		expect(loginSpy).toHaveBeenCalledWith(component.newUser);
		expect(component.newUser.existingUser).toBeTrue();
	});

	it('should call authService.login with existingUser false on register button click', () => {
		component.newUser = new UserLogin('testuser', 'password', false);

		const registerButton: DebugElement = fixture.debugElement.query(By.css('.button-register'));
		registerButton.triggerEventHandler('click', null);

		expect(loginSpy).toHaveBeenCalledWith(component.newUser);
		expect(component.newUser.existingUser).toBeFalse();
	});

	it('should bind input fields to newUser model', () => {
		const nameInput: HTMLInputElement = fixture.debugElement.query(By.css('input[name="name"]')).nativeElement;
		const passwordInput: HTMLInputElement = fixture.debugElement.query(By.css('input[name="password"]')).nativeElement;

		nameInput.value = 'testuser';
		passwordInput.value = 'password';
		nameInput.dispatchEvent(new Event('input'));
		passwordInput.dispatchEvent(new Event('input'));

		fixture.detectChanges();

		expect(component.newUser.name).toBe('testuser');
		expect(component.newUser.password).toBe('password');
	});
});
