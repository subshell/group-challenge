import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../appContext';

function Navigation() {
  const [appContext] = useContext(AppContext);

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
          <span>Hi, {appContext.user?.username}</span>
        </nav>
      </div>
    </header>
  );
}

export default Navigation;
