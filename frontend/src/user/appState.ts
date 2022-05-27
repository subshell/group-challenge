import useLocalStorageState from 'use-local-storage-state';

export interface AppState {
  reactionPickerOpen: boolean;
}

export const useAppState = () =>
  useLocalStorageState<AppState>('appState', {
    ssr: false,
    defaultValue: {
      reactionPickerOpen: true,
    },
  });
