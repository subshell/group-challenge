import { useCallback } from 'react';
import { FaGraduationCap, FaUserAstronaut } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { signOut } from '../api';
import { useSession } from '../user/session';

function Navigation() {
  const [session, , removeSession] = useSession();
  const signOutAndRemoveSession = async () => {
    try {
      await signOut();
      removeSession();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="text-gray-600 body-font">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center justify-between">
        <Link className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0" to="/">
          <FaGraduationCap size={32} />
          <span className="ml-3 text-xl">Group Challenge</span>
        </Link>
        <nav className="flex flex-wrap text-base">
          {session && (
            <span className="space-x-3">
              <Link to="/profile">
                <FaUserAstronaut className="w-6 h-6 inline-block mr-2" />
                {session.username}
              </Link>

              <button onClick={signOutAndRemoveSession}>Sign out</button>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navigation;
