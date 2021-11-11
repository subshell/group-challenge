import { FaInfo } from 'react-icons/fa';
import { useParties } from '../../api/api';
import PartiesOverviewItem from '../PartyListItem';

function Archive() {
  const { data: parties, isError, isLoading, refetch } = useParties();

  if (isError) return <p>ERROR!</p>;
  if (isLoading) return <p>loading archive...</p>;

  const closedParties = (parties || [])
    .filter((party) => party.done)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  if (!closedParties?.length) {
    return (
      <div className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3" role="alert">
        <FaInfo className="mr-2" />
        <p>No archieved parties available... 😢</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl pl-4">📚 Archive</h1>
      <div className="flex flex-wrap">
        {closedParties.map((party) => (
          <PartiesOverviewItem key={party.id} partyId={party.id} onPartyChange={refetch} />
        ))}
      </div>
    </div>
  );
}

export default Archive;
