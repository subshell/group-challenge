import { Link } from 'react-router-dom';
import { useParties } from '../api/api';
import { PartyResponse } from '../api/api-models';
import { Footer } from '../Footer';
import HighlightedParty from '../party/HighlightedParty';
import { PartyTimelines } from '../party/timeline/PartyTimelines';

export function Home() {
  const { data: parties, isError, isLoading, fetchNextPage, hasNextPage } = useParties();

  if (isError) return <p>ERROR!</p>;
  if (isLoading || !parties) return <div></div>;

  const visibleParties = parties.pages.reduce((a, b) => a.concat(b.data), [] as PartyResponse[]);

  const highlightedParty = visibleParties
    .filter((party) => !party.done)
    .sort((a, b) => new Date(a.endDate).getDate() - new Date(b.endDate).getDate())[0];

  return (
    <div className="flex flex-col justify-between">
      <div className="flex flex-col space-y-28">
        {highlightedParty && (
          <div>
            <h2 className="font-bold text-2xl mb-4 dark:text-slate-300">Next up:</h2>
            <HighlightedParty party={highlightedParty} />
          </div>
        )}
        {!highlightedParty && (
          <Link
            to={'/party/create'}
            className="flex place-items-center space-x-2 text-blue-500 hover:opacity-75 cursor-pointer"
          >
            <div className="w-full h-36 border-2 font-bold text-xl rounded border-dashed border-gray-700 hover:bg-slate-200 hover:dark:bg-slate-700 flex items-center justify-center">
              Create New Challenge
            </div>
          </Link>
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
