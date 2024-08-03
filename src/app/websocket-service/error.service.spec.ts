import { TestBed } from '@angular/core/testing';
import { ErrorService } from './error.service';
import { first } from 'rxjs/operators';

describe('ErrorService', () => {
	let service: ErrorService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ErrorService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should emit error message when setError is called', (done) => {
		const testError = 'Test Error Message';

		service.currentError$.pipe(first()).subscribe(error => {
			expect(error).toBe(testError);
			done();
		});

		service.setError(testError);
	});

	it('should emit null when setError is called with null', (done) => {
		service.currentError$.pipe(first()).subscribe(error => {
			expect(error).toBeNull();
			done();
		});

		service.setError(null);
	});
});
