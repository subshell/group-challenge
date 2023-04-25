import { FunctionComponent } from 'react';
import { PartyResponse } from '../../api/api-models';
import PartyOverviewItem from '../PartyOverviewItem';

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
] as const;

export const PartyTimeline: FunctionComponent<{ year: number; parties: PartyResponse[] }> = ({ year, parties }) => {
  if (parties?.length === 0) {
    return null;
  }

  const reversedParties = [...parties].sort((a, b) => new Date(b.endDate).getDate() - new Date(a.endDate).getDate());

  const timeline = new Map<string, PartyResponse[]>();
  for (const party of reversedParties) {
    if (new Date(party.endDate).getFullYear() !== year || !party.done) {
      continue;
    }

    const month = new Date(party.endDate).getMonth();
    const key = months[month];
    if (!timeline.has(key)) {
      timeline.set(key, []);
    }
    timeline.get(key)!.push(party);
  }

  const monthsWithSumissions = [...months].reverse().filter((month) => timeline.has(month));

  return (
    <div className="space-y-6">
      <h1 className="font-bold text-4xl dark:text-slate-300">{year}</h1>
      {monthsWithSumissions.map((month) => (
        <div key={month} className="space-y-4 m-2">
          <h2 className="font-bold text-2xl dark:text-slate-300">{month}</h2>
          {timeline.get(month)!.map((party) => (
            <div key={party.id}>
              <PartyOverviewItem party={party} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
