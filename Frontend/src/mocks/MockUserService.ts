import { BehaviorSubject } from "rxjs";
import { User } from "../types/user";

export class MockUserService {
	private currentUserSubject = new BehaviorSubject<User | null>(null);
	currentUser$ = this.currentUserSubject.asObservable();
  
	emitCurrentUser(user: User | null): void {
		this.currentUserSubject.next(user);
	}

	handleLogout(): void {
		this.currentUserSubject.next(null);
	}
}