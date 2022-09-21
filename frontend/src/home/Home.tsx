import { useParties } from '../api/api';
import { PartyResponse } from '../api/api-models';
import { Footer } from '../Footer';
import HighlightedParty from '../party/HighlightedParty';
import { PartyTimelines } from '../party/timeline/PartyTimelines';

export function Home() {
  const { data: parties, isError, isLoading, fetchNextPage, hasNextPage } = useParties();

  if (isError) return <p>ERROR!</p>;
  if (isLoading) return <div></div>;

  const visibleParties = parties.pages.reduce((a, b) => a.concat(b.data), [] as PartyResponse[]);

  const highlightedParty = visibleParties
    .filter((party) => !party.done)
    .sort((a, b) => new Date(b.endDate).getDate() - new Date(a.endDate).getDate())[0];

  return (
    <div className="flex flex-col justify-between">
      <div className="flex flex-col space-y-28">
        {highlightedParty && (
          <div>
            <h2 className="font-bold text-2xl mb-4 dark:text-slate-300">Next up:</h2>
            <HighlightedParty party={highlightedParty} />
          </div>
        )}
        <PartyTimelines parties={visibleParties} />
        {hasNextPage && (
          <button onClick={() => fetchNextPage()} className="hover:text-slate-500 px-4 py-2 rounded">
            Load More
          </button>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Home;
