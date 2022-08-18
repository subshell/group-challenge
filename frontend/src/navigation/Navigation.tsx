import { FaUserGraduate } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { signOut } from '../api/api';
import { useSession } from '../user/session';
import { VERSION } from '../version';

function Navigation() {
  const [session, setSession] = useSession();
  const signOutAndRemoveSession = async () => {
    try {
      await signOut();
      setSession(undefined);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="text-gray-900 body-font">
      <div className="container mx-auto flex flex-wrap p-5 mb-8 flex-col md:flex-row items-center justify-between border-b-2 border-gray-600">
        <div className="flex title-font font-medium items-center mb-4 md:mb-0 space-x-2">
          <Link to="/">
            <span className="text-xl hover:text-gray-500 hover:underline">Group Challenge</span>
          </Link>
          <Link to="/changelog" title="Changelog">
            <span className="text-sm font-bold pr-4 hover:text-gray-500 hover:underline">{VERSION}</span>
          </Link>

          {session && (
            <>
              <Link
                className="hover:text-white hover:bg-blue-500 hover:outline-cyan-500  focus:ring-cyan-500 font-medium rounded px-5 py-1 text-center"
                to="/party/create"
              >
                Create a Challenge
              </Link>
            </>
          )}
        </div>
        <nav className="flex flex-wrap text-base">
          {session && (
            <span className="space-x-10">
              <Link to="/profile" className="hover:text-gray-500 hover:underline">
                <FaUserGraduate size={20} className="inline-block mr-2" />
                {session.username}
              </Link>

              <button className="hover:text-gray-500  hover:underline" onClick={signOutAndRemoveSession}>
                Sign out
              </button>
            </span>
          )}
          {!session && (
            <Link
              className="flex rounded-full text-white bg-indigo-500 hover:bg-indigo-400 uppercase px-3 py-1 text-xs font-bold mr-3"
              to="/signup"
            >
              Sign Up
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navigation;
