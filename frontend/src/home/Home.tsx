import PartiesOverview from '../party/PartyList';
import { useSession } from '../user/session';
import { SignIn } from '../user/SignInAndSignUp';

export function Home() {
  const [session] = useSession();
  return session ? <PartiesOverview /> : <SignIn />;
}

export default Home;
