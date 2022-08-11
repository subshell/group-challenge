import { useParties } from '../api/api';
import { Footer } from '../Footer';
import HighlightedParty from '../party/HighlightedParty';
import PartyList from '../party/PartyList';
import { useSession } from '../user/session';
import { SignIn } from '../user/SignInAndSignUp';

export function Home() {
  const [session] = useSession();
  const { data: parties, isError, isLoading } = useParties();

  if (!session) {
    return <SignIn />;
  }

  if (isError) return <p>ERROR!</p>;
  if (isLoading) return <div></div>;

  const highlightedParty = parties
    .filter((party) => !party.done)
    .sort((a, b) => new Date(b.endDate).getDate() - new Date(a.endDate).getDate())[0];

  return (
    <div className="flex flex-col justify-between h-screen">
      <div className="flex flex-col space-y-12">
        {highlightedParty && <HighlightedParty party={highlightedParty} />}
        <PartyList />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
