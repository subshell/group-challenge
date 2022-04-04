import { FaInfo } from 'react-icons/fa';
import { useParties } from '../api/api';
import PartiesOverviewItem from './PartyListItem';

function PartyList() {
  const { data: parties, isError, isLoading, refetch } = useParties();

  if (isError) return <p>ERROR!</p>;
  if (isLoading) return <p>loading parties...</p>;
  if (!parties?.length) {
    return (
      <div className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3" role="alert">
        <FaInfo className="mr-2" />
        <p>No Parties available... 😢</p>
      </div>
    );
  }

  const reversedParties = [...parties].reverse();
  const openAndLiveParties = reversedParties.filter((party) => !party.done);

  if (openAndLiveParties.length === 0) {
    return (
      <div className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3" role="alert">
        <FaInfo className="mr-2" />
        <p>No open challenges available... 😢</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="my-8 flex flex-wrap">
        {openAndLiveParties.map((party) => (
          <PartiesOverviewItem key={party.id} partyId={party.id} onPartyChange={refetch} />
        ))}
      </div>
    </div>
  );
}

export default PartyList;
