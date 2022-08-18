import { FunctionComponent } from 'react';
import { useParties } from '../../api/api';
import { PartyResponse } from '../../api/api-models';
import PartiesOverviewItem from '../PartyOverviewItem';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const PartyTimeline: FunctionComponent<{ year: number }> = ({ year }) => {
  const { data: parties } = useParties();

  if (!parties) {
    return null;
  }

  const reversedParties = [...parties].sort((a, b) => new Date(b.endDate).getDate() - new Date(a.endDate).getDate());

  const timeline = new Map<string, PartyResponse[]>();
  for (const party of reversedParties) {
    if (new Date(party.endDate).getFullYear() !== year) {
      continue;
    }

    const month = new Date(party.endDate).getMonth();
    const key = months[month];
    if (!timeline.has(key)) {
      timeline.set(key, []);
    }
    timeline.get(key)!.push(party);
  }

  return (
    <div className="space-y-6">
      <h1 className="font-extrabold text-4xl text-white bg-cyan-600 px-4 py-2 rounded-md">{year}</h1>
      {[...months].reverse().map((month) => (
        <div key={month} className="space-y-4 m-2">
          {timeline.has(month) && (
            <>
              <h2 className="font-extrabold text-2xl text-cyan-600">{month}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gab-4">
                {timeline.get(month)!.map((party) => (
                  <div key={party.id} className="">
                    <PartiesOverviewItem party={party} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
