import { Subject } from "rxjs";
import { Message } from "../types/message";

export class MockMessageService {
	private subject = new Subject<Message>();
	messages$ = this.subject.asObservable();

	private resetMessagesSubject = new Subject<void>();
	resetMessages$ = this.resetMessagesSubject.asObservable();

	emitMessage(message: Message) {
		this.subject.next(message);
	}
}