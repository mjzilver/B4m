import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'app-error-display',
	templateUrl: './error-display.component.html',
	styleUrl: './error-display.component.css'
})
export class ErrorDisplayComponent implements OnInit {

	@Input() error: string | null = '';

	constructor() { }

	ngOnInit(): void {
	}

	closeError() {
		this.error = null;
	}

	// if error changes, close it after 5 seconds
	ngOnChanges(): void {
		if (this.error) {
			setTimeout(() => this.closeError(), 5000);
		}
	}
}
