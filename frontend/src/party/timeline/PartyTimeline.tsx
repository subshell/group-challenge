import { FunctionComponent } from 'react';
import { useParties, getThumbnailUrl } from '../../api/api';
import { PartyResponse } from '../../api/api-models';

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
      <h1 className="font-extrabold text-4xl text-white bg-cyan-500 px-4 py-2">{year}</h1>
      {[...months].reverse().map((month) => (
        <div key={month} className="space-y-4 m-2">
          {timeline.has(month) && (
            <>
              <h2 className="font-extrabold text-2xl text-slate-500">{month}</h2>
              <div className="flex space-x-2">
                {timeline.get(month)!.map((party) => (
                  <div key={party.id} title={party.name} className="border border-slate-500 relative">
                    <a href={'/party/view/' + party.id} className="inline-block w-80 h-40">
                      {party.done && (
                        <img src={getThumbnailUrl(party.submissions[0]?.imageId)} alt={party.name} className="fit" />
                      )}
                      <div className="absolute bottom-4 left-0">
                        <span className="font-bold px-2 py-1 text-xs tracking-tight bg-white text-slate-500 dark:bg-slate-500 dark:text-white text-ellipsis inline-block">
                          {party.name}
                        </span>
                      </div>
                    </a>
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
