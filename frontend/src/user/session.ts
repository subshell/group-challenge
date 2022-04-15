import { UserSession } from '../api/api-models';
import useLocalStorageState from 'use-local-storage-state';

export const useSession = () => useLocalStorageState<UserSession>('session');
