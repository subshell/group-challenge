import { useContext, useRef } from 'react';
import { AppContext } from '../appContext';

function StartScreen() {
  const [appContext, setAppContext] = useContext(AppContext);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="text-gray-600 body-font flex flex-col justify-center">
      <div className="container px-5 py-24 mx-auto flex space-x-2">
        <div className="relative flex-grow w-full">
          <input
            ref={usernameInputRef}
            placeholder="Name"
            type="text"
            id="username"
            name="username"
            autoComplete="false"
            autoCorrect="false"
            className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-blue-500 focus:bg-transparent focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>
        <button
          onClick={() =>
            setAppContext({
              ...appContext,
              user: {
                username: usernameInputRef.current!.value,
              },
            })
          }
          className="text-white bg-blue-500 border-0 py-2 px-8 focus:outline-none hover:bg-blue-600 rounded"
        >
          Go
        </button>
      </div>
    </section>
  );
}

export default StartScreen;
