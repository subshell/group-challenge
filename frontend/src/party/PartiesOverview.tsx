import { useParties } from '../api';
import PartiesOverviewItem from './PartiesOverviewItem';

function PartiesOverview() {
  const { partyIds, isError, isLoading } = useParties();

  if (isError) return <span>ERROR</span>;
  if (isLoading) return <span>LOADING</span>;

  return (
    <section className="text-gray-600 body-font overflow-hidden">
      <div className="container px-5 py-24 mx-auto">
        <div className="-my-8 divide-y-2 divide-gray-100">
          {partyIds!.map((partyId) => (
            <PartiesOverviewItem key={partyId} partyId={partyId} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PartiesOverview;
