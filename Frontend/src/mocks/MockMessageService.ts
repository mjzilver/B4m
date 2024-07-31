import { Subject } from "rxjs";
import { Message } from "../types/message";

export class MockMessageService {
	private subject = new Subject<Message>();
	messages$ = this.subject.asObservable();

	emitMessage(message: Message) {
		this.subject.next(message);
	}
}