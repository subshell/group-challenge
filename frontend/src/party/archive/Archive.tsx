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
        <p>It's pretty empty here... 😢</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl">Expired Challenges</h1>
      <div className="flex flex-wrap">
        {closedParties.map((party) => (
          <PartiesOverviewItem key={party.id} partyId={party.id} onPartyChange={refetch} />
        ))}
      </div>
    </>
  );
}

export default Archive;
