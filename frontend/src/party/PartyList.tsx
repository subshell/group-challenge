import { FaInfo } from 'react-icons/fa';
import { useParties } from '../api';
import PartiesOverviewItem from './PartyListItem';

function PartyList() {
  const { data: parties, isError, isLoading } = useParties();

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
  const closedParties = reversedParties.filter((party) => party.done);

  return (
    <div className="container px-5 pt-5 mx-auto">
      <div className="my-8 divide-y-2 divide-gray-100">
        {openAndLiveParties.map((party) => (
          <PartiesOverviewItem key={party.id} partyId={party.id} />
        ))}
      </div>
      <div className="my-8 divide-y-2 divide-gray-100">
        <h1 className="text-lg">Closed Parties</h1>
        {closedParties.map((party) => (
          <PartiesOverviewItem key={party.id} partyId={party.id} />
        ))}
      </div>
    </div>
  );
}

export default PartyList;
