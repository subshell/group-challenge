import { getParties } from '../api';
import PartiesOverviewItem from './PartiesOverviewItem';

function PartiesOverview() {
  const parties = getParties();

  return (
    <section className="text-gray-600 body-font overflow-hidden">
      <div className="container px-5 py-24 mx-auto">
        <div className="-my-8 divide-y-2 divide-gray-100">
          {parties.map((party) => (
            <PartiesOverviewItem key={party.id} party={party} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PartiesOverview;
