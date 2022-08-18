import { useParties } from '../api/api';
import { Footer } from '../Footer';
import HighlightedParty from '../party/HighlightedParty';
import { PartyTimelines } from '../party/timeline/PartyTimelines';
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
      <div className="flex flex-col space-y-28">
        {highlightedParty && (
          <div>
            <h2 className="font-extrabold text-2xl text-cyan-600 mb-4">Next up:</h2>
            <HighlightedParty party={highlightedParty} />
          </div>
        )}
        <PartyTimelines parties={parties} />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
