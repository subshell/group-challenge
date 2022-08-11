import { FunctionComponent, useState } from 'react';
import { PartyTimeline } from './PartyTimeline';

export const PartyTimelines: FunctionComponent = () => {
  const [years, setYears] = useState<number[]>(() => [new Date().getFullYear()]);

  return (
    <div className="flex flex-col space-y-10">
      {years.map((year) => (
        <div key={year}>
          <PartyTimeline year={year} />
        </div>
      ))}

      <div className="m-2">
        <button
          className="hover:bg-slate-900 hover:text-white font-bold py-2 px-4 rounded border-2 border-slate-900 mb-4 w-full"
          onClick={() => setYears([...years, years[years.length - 1] - 1])}
        >
          Previous Year
        </button>
      </div>
    </div>
  );
};
