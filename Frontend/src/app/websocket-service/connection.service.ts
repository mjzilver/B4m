import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ConnectionService {
	private ws!: WebSocket;
	private connectionStatusSubject = new Subject<boolean>();

	connectionStatus$ = this.connectionStatusSubject.asObservable();

	connect(url: string): void {
		this.ws = new WebSocket(url);

		this.ws.onopen = () => this.handleOpen();
		this.ws.onclose = () => this.handleClose();
		this.ws.onerror = (error) => this.handleError(error);
	}

	onMessage(callback: (event: MessageEvent) => void): void {
		this.ws.onmessage = callback;
	}

	private handleOpen(): void {
		this.connectionStatusSubject.next(true);
	}

	private handleClose(): void {
		this.connectionStatusSubject.next(false);

		// Attempt to reconnect after a delay
		setTimeout(() => this.connect(this.ws.url), 1000);
	}

	private handleError(error: Event): void {
		console.error('WebSocket error', error);
	}

	sendMessage(obj: unknown): void {
		if (this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(obj));
		} else {
			console.warn('WebSocket not open');
		}
	}
}
