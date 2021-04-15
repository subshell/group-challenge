import { useCallback, useEffect } from 'react';
import { useLocalStorage } from 'react-use';
import { UserSession } from '../api-models';

// issue: https://github.com/streamich/react-use/issues/1831
const sessionChangeListener: Array<(value: UserSession | undefined) => void> = [];
export const useSession: () => [UserSession | undefined, (v: UserSession) => void, () => void] = () => {
  const [session, setSession, removeSession] = useLocalStorage<UserSession | undefined>('session');

  const removeSessionCB = useCallback(() => {
    removeSession();
    sessionChangeListener.forEach((fn) => fn(undefined));
  }, [removeSession]);

  const setSessionCB = useCallback(
    (value) => {
      setSession(value);
      sessionChangeListener.forEach((fn) => fn(value));
    },
    [setSession]
  );

  useEffect(() => {
    const fn = (value: UserSession | undefined) => {
      value ? setSession(value) : removeSession();
    };
    sessionChangeListener.push(fn);

    return () => {
      sessionChangeListener.splice(sessionChangeListener.indexOf(fn), 1);
    };
  }, [setSession, removeSession]);

  return [session, setSessionCB, removeSessionCB];
};
