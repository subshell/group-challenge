import { useState } from 'react';
import { useParties } from '../api/api';
import { PartyTable } from './table/PartyTable';
import { PartyTimelines } from './timeline/PartyTimelines';

function PartyList() {
  const [displayType, setDisplayType] = useState('table');
  const { data: parties, isError, isLoading } = useParties();

  if (isError) return <p>ERROR!</p>;
  if (isLoading) return <p>loading parties...</p>;

  const reversedParties = [...parties].sort((a, b) => new Date(b.endDate).getDate() - new Date(a.endDate).getDate());

  return (
    <div>
      <div className="flex flex-row ">
        {['table', 'timeline'].map((type, i) => (
          <button
            key={type}
            className={`font-bold py-2 px-4 border-2 border-slate-500 w-full ${
              type === displayType ? 'border-b-0' : 'hover:bg-slate-500 hover:text-white'
            }
            ${i !== 0 && 'border-l-0'}`}
            onClick={() => setDisplayType(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="border-2 border-t-0 border-slate-500 pt-8 rounded-b-md">
        {displayType === 'table' && <PartyTable parties={reversedParties} />}
        {displayType === 'timeline' && <PartyTimelines />}
      </div>
    </div>
  );
}

export default PartyList;
