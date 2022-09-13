import { FunctionComponent } from 'react';
import { PartyResponse } from '../../api/api-models';
import { PartyTimeline } from './PartyTimeline';

export const PartyTimelines: FunctionComponent<{ parties: PartyResponse[] }> = ({ parties }) => {
  const yearsSet = new Set(parties.map((party) => new Date(party.endDate).getFullYear()));
  const years = [...yearsSet].sort((a, b) => b - a);

  return (
    <div className="flex flex-col space-y-10">
      {years.map((year) => (
        <div key={year}>
          <PartyTimeline year={year} parties={parties} />
        </div>
      ))}
    </div>
  );
};
