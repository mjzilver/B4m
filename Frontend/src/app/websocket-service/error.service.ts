import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ErrorService {
	private errorSubject = new Subject<string | null>();
	currentError$ = this.errorSubject.asObservable();

	setError(error: string | null): void {
		this.errorSubject.next(error);
	}
}
