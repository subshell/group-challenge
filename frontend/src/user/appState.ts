import { createLocalStorageStateHook } from 'use-local-storage-state';

export interface AppState {
  reactionPickerOpen: boolean;
}

export const useAppState = createLocalStorageStateHook<AppState>('appState', { reactionPickerOpen: true });
