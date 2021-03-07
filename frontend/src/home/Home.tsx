import { Link } from 'react-router-dom';
import PartyList from '../party/PartyList';
import { useSession } from '../user/session';
import { SignIn } from '../user/SignInAndSignUp';

export function Home() {
  const [session] = useSession();
  return session ? (
    <div>
      <Link
        className="rounded-full text-white bg-indigo-500 uppercase px-4 py-2 text-xs font-bold mr-3"
        to="/party/create"
      >
        New
      </Link>
      <PartyList />
    </div>
  ) : (
    <SignIn />
  );
}

export default Home;
