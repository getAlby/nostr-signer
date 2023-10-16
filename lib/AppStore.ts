import { Notification } from "expo-notifications";
import { create } from "zustand";

interface AppState {
  readonly notifications: Notification[];
  addNotification: (notification: Notification) => void;
  shiftNotification(): void;
}

export const useAppStore = create<AppState>()((set, get) => ({
  notifications: [],
  addNotification: (notification) =>
    set({
      notifications: [...get().notifications, notification],
    }),
  shiftNotification: () =>
    set({
      notifications: get().notifications.slice(1),
    }),
}));
