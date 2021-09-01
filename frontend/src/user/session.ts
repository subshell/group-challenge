import { UserSession } from '../api/api-models';
import { createLocalStorageStateHook } from 'use-local-storage-state';

export const useSession = createLocalStorageStateHook<UserSession>('session');
