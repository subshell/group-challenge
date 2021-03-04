import { useParty } from '../api';
import LinkButton from '../components/LinkButton';

function PartiesOverviewItem({ partyId }: { partyId: string }) {
  const { data: party, isError, isLoading } = useParty(partyId);

  if (isError) return <span>ERROR</span>;
  if (isLoading || !party) return <span>LOADING</span>;

  return (
    <div className="border border-gray-200 py-8 px-8 flex flex-col flex-wrap md:flex-nowrap">
      <h2 className="text-2xl font-medium text-gray-900 title-font mb-2">{party.name}</h2>
      <p>
        <span className="text-sm text-gray-500">
          {new Date(party.startDate).toLocaleDateString()} - {new Date(party.endDate).toLocaleDateString()}
        </span>
      </p>

      <p className="leading-relaxed">{party.description}</p>
      <div className="space-x-2 mt-2">
        <LinkButton to={'/event/view/' + party.id} text="View" />
        <LinkButton to={'/event/post/' + party.id} text="Post" />
        <LinkButton to={'/event/edit/' + party.id} text="Edit" />
      </div>
    </div>
  );
}

export default PartiesOverviewItem;
