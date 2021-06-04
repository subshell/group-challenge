import { FaStar } from 'react-icons/fa';
import { getImageUrl } from '../../api/api';
import { PartyResponse, PartyStatusResponse } from '../../api/api-models';
import { totalRating, avgRating } from './util';

// TODO use websocket events
function ViewPartyReveal({ party, partyStatus }: { party: PartyResponse; partyStatus: PartyStatusResponse }) {
  if (!partyStatus.current) {
    return <div>Error: No submission available</div>;
  }

  const currentSumbission = party.submissions[partyStatus.current!.index];

  return (
    <div>
      <div className="bg-gray-100 relative">
        <a href={getImageUrl(currentSumbission.imageId)} target="_blank" rel="noopener noreferrer">
          <img
            className="object-contain w-full rounded"
            style={{
              maxHeight: '80vh',
            }}
            src={getImageUrl(currentSumbission.imageId)}
            alt={currentSumbission.name}
          />
        </a>
      </div>
      <div className="flex flex-row justify-between mt-8">
        <div className="space-y-2">
          <p>
            <span className="text-gray-800 text-xl mr-4">{currentSumbission.name}</span>
            <span className="text-gray-600">{currentSumbission.description}</span>
          </p>
        </div>
        <div className="flex flex-row justify-center text-gray-600 text-xl items-center space-x-2">
          <span className="border border-gray-700 px-4 py-2 flex items-center space-x-2">{2}.</span>
          <div className="border border-gray-700 rounded px-4 py-2 flex items-center space-x-2">
            <span>{totalRating(currentSumbission)}</span> <FaStar size={14} />
          </div>
          <span className="border border-gray-700 px-4 py-2 flex items-center space-x-2">
            Ø {avgRating(currentSumbission)}
          </span>
          <span className="border border-gray-700 px-4 py-2 flex items-center space-x-2">
            {currentSumbission.votes.length} votes
          </span>
        </div>
      </div>
    </div>
  );
}
export default ViewPartyReveal;
