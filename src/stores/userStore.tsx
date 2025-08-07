import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserState = {
  userId: string;
  userName: string;
};
export type UserActions = {
  setUserName: (name: string) => void;
};
export type UserStore = UserState & UserActions;

export const defaultUserState: UserState = {
  userId: "",
  userName: "",
};

export const createUserStore = (initState: UserState = defaultUserState) => {
  return create<UserStore>()(
    persist(
      (set, get) => ({
        ...initState,
        userId: initState.userId || `user_${Math.random().toString(36).substr(2, 9)}`,
        userName: initState.userName || "",
        setUserName: (name: string) =>
          set({
            userName: name,
            userId: get().userId || `user_${Math.random().toString(36).substr(2, 9)}`,
          }),
      }),
      {
        name: "user-storage",
      }
    )
  );
};
