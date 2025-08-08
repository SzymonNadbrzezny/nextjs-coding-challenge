import { test, expect } from "@playwright/test";
import {
	createUserStore,
	defaultUserState,
	UserStore,
} from "@/stores/userStore";

// src/stores/userStore.test.tsx

// Mock localStorage for zustand persist
class LocalStorageMock {
	store: Record<string, string> = {};
	clear() {
		this.store = {};
	}
	getItem(key: string) {
		return this.store[key] || null;
	}
	setItem(key: string, value: string) {
		this.store[key] = value.toString();
	}
	removeItem(key: string) {
		delete this.store[key];
	}
}
global.localStorage = new LocalStorageMock() as any;

test.describe("userStore", () => {
	test.beforeEach(() => {
		global.localStorage.clear();
	});

	test("should initialize with default state and generate userId", () => {
		const store = createUserStore();
		const state = store.getState();
		expect(state.userName).toBe("");
		expect(state.userId).toMatch(/^user_[a-z0-9]{9}$/);
	});

	test("should set userName and keep userId", () => {
		const store = createUserStore();
		const prevUserId = store.getState().userId;
		store.getState().setUserName("Alice");
		const state = store.getState();
		expect(state.userName).toBe("Alice");
		expect(state.userId).toBe(prevUserId);
	});

	test("should respect initial state if provided", () => {
		const store = createUserStore({ userId: "abc", userName: "Bob" });
		const state = store.getState();
		expect(state.userId).toBe("abc");
		expect(state.userName).toBe("Bob");
	});

	test("should persist state to localStorage", () => {
		const store = createUserStore();
		store.getState().setUserName("Charlie");
		const persisted = JSON.parse(global.localStorage.getItem("user-storage")!);
		expect(persisted.state.userName).toBe("Charlie");
		expect(persisted.state.userId).toBe(store.getState().userId);
	});
});
