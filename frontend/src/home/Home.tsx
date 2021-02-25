import PartyList from '../party/PartyList';
import { useSession } from '../user/session';
import { SignIn } from '../user/SignInAndSignUp';

export function Home() {
  const [session] = useSession();
  return session ? <PartyList /> : <SignIn />;
}

export default Home;
