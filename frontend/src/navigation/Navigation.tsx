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
    <header className="text-gray-200  bg-gray-800 body-font">
      <div className="container mx-auto flex flex-wrap p-5 mb-8 flex-col md:flex-row items-center justify-between">
        <div className="flex title-font font-medium items-center mb-4 md:mb-0 space-x-6">
          <Link to="/">
            <span className="text-xl hover:text-gray-300">Group Challenge</span>
          </Link>
          {session && (
            <Link className="hover:text-gray-300" to="/party/create">
              Create Party
            </Link>
          )}
        </div>
        <nav className="flex flex-wrap text-base">
          {session && (
            <span className="space-x-10">
              <Link to="/profile" className="hover:text-gray-300">
                <FaUserAstronaut size={20} className="inline-block mr-2" />
                {session.username}
              </Link>

              <button onClick={signOutAndRemoveSession}>Sign out</button>
            </span>
          )}
          {!session && (
            <Link
              className="flex rounded-full hover:text-gray-300 bg-indigo-500 hover:bg-indigo-400 uppercase px-3 py-1 text-xs font-bold mr-3"
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
