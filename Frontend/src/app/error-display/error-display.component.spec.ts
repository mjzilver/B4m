import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ErrorDisplayComponent } from './error-display.component';

describe('ErrorDisplayComponent', () => {
	let component: ErrorDisplayComponent;
	let fixture: ComponentFixture<ErrorDisplayComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ErrorDisplayComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ErrorDisplayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display error message when error is not null', () => {
		component.error = 'Test error message';
		fixture.detectChanges();

		const errorContainer = fixture.debugElement.query(By.css('.error-container'));
		const errorMessage = fixture.debugElement.query(By.css('.error-card-message'));

		expect(errorContainer).toBeTruthy();
		expect(errorMessage.nativeElement.textContent).toContain('Test error message');
	});

	it('should not display error message when error is null', () => {
		component.error = null;
		fixture.detectChanges();

		const errorContainer = fixture.debugElement.query(By.css('.error-container'));
    
		expect(errorContainer).toBeNull();
	});

	it('should not display error message when error is an empty string', () => {
		component.error = '';
		fixture.detectChanges();

		const errorContainer = fixture.debugElement.query(By.css('.error-container'));
    
		expect(errorContainer).toBeNull();
	});
});
