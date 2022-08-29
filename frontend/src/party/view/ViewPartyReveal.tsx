import { FaStar } from 'react-icons/fa';
import { getImageUrl } from '../../api/api';
import { PartyResponse, PartyStatusResponse } from '../../api/api-models';
import ReactionBubbles from './ReactionBubbles';
import PartyPosition from './rewards/PartyPosition';
import { totalRating, avgRatingTwoDecimals, getSubmissionVotes } from './util';

function ViewPartyReveal({ party, partyStatus }: { party: PartyResponse; partyStatus: PartyStatusResponse }) {
  if (!partyStatus.current) {
    return <div>Error: No submission available</div>;
  }

  const currentSumbission = party.submissions[partyStatus.current!.index];
  const votes = getSubmissionVotes(partyStatus, currentSumbission);

  return (
    <div>
      <div className="relative">
        <a href={getImageUrl(currentSumbission.imageId)} target="_blank" rel="noopener noreferrer">
          <img
            className="object-contain w-full rounded bg-gray-100 "
            style={{
              maxHeight: '75vh',
            }}
            src={getImageUrl(currentSumbission.imageId)}
            alt={currentSumbission.name}
          />
        </a>
        <div className="absolute right-2 bottom-2">
          <ReactionBubbles partyId={party.id} />
        </div>
      </div>
      <div className="flex flex-row justify-between mt-8">
        <div className="space-y-2">
          <p>
            <span className="text-xl mr-4">{currentSumbission.name}</span>
            <span className="text-slate-500">{currentSumbission.description}</span>
          </p>
        </div>
        <div className="flex flex-row justify-center text-slate-500 text-xl items-center space-x-2">
          <span className="border border-slate-500 px-4 py-2 flex items-center space-x-2">
            <PartyPosition position={partyStatus.sequence.length - partyStatus.current.position - 1} />
          </span>
          <div className="border border-slate-500 rounded px-4 py-2 flex items-center">
            <span>Ø {avgRatingTwoDecimals(votes)}</span>
          </div>
          <span className="border border-slate-500 px-4 py-2 flex items-center space-x-1">
            <span>{totalRating(votes)}</span>
            <FaStar size={14} />
          </span>

          <span className="border border-slate-500 px-4 py-2 flex items-center space-x-2">
            {currentSumbission.votes.length} vote(s)
          </span>
        </div>
      </div>
    </div>
  );
}
export default ViewPartyReveal;
