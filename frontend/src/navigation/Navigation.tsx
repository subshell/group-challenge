import { useCallback } from 'react';
import { FaUserAstronaut } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { signOut } from '../api';
import { useSession } from '../user/session';

function Navigation() {
  const [session, , removeSession] = useSession();
  const signOutAndRemoveSession = useCallback(() => {
    signOut()
      .then(() => {
        removeSession();
      })
      .catch((e) => console.error(e));
  }, [session]);

  return (
    <header className="text-gray-600 body-font">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center justify-between">
        <Link className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0" to="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="ml-3 text-xl">Group Challenge</span>
        </Link>
        <nav className="flex flex-wrap text-base">
          {session && (
            <span className="space-x-3">
              <FaUserAstronaut className="w-6 h-6 inline-block mr-2" />
              {session.username} <button onClick={signOutAndRemoveSession}>Sign out</button>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navigation;
