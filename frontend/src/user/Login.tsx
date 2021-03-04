import { useCallback, useContext, useRef } from 'react';
import { signIn } from '../api';
import { AppContext } from '../appContext';
import Button from '../components/Button';

function Login() {
  const [appContext, setAppContext] = useContext(AppContext);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const signInAndSetContext = useCallback(() => {
    (async () => {
      if (!usernameInputRef.current?.value || !passwordInputRef.current?.value) {
        return;
      }

      await signIn(usernameInputRef.current.value, passwordInputRef.current.value);

      setAppContext({
        ...appContext,
        user: {
          username: usernameInputRef.current!.value,
        },
      });
    })();
  }, []);

  return (
    <>
      <div className="mb-4">
        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="username">
          Username
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
          id="username"
          type="text"
          ref={usernameInputRef}
        />
      </div>
      <div className="mb-6">
        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input
          className="shadow appearance-none border border-red rounded w-full py-2 px-3 text-grey-darker mb-3"
          id="password"
          type="password"
          ref={passwordInputRef}
        />
      </div>
      <div className="flex items-center justify-between">
        <Button onClick={signInAndSetContext}>Sign In</Button>
      </div>
    </>
  );
}

export default Login;
