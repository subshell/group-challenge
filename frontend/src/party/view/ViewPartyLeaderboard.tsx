import { FaMedal, FaStar } from 'react-icons/fa';
import { getImageUrl } from '../../api/api';
import { PartyResponse } from '../../api/api-models';
import PartyPosition from './rewards/PartyPosition';

import { totalRating, avgRating, sortSubmissions } from './util';

function ViewPartyLeaderboard({ party }: { party: PartyResponse }) {
  const sortedSubmissions = sortSubmissions(party.submissions);
  return (
    <section className="text-gray-600 body-font">
      <div className="space-y-4">
        {sortedSubmissions.map((submission, i) => (
          <div className="flex items-center justify-items-center space-x-4 space-y-4" key={submission.id}>
            <PartyPosition position={i} />
            <div className="flex items-center">
              <a href={getImageUrl(submission.imageId)} target="_blank" rel="noopener noreferrer">
                <img
                  className="object-contain w-96 h-60 rounded"
                  src={getImageUrl(submission.imageId)}
                  alt={submission.name}
                />
              </a>
            </div>
            <div className="flex flex-col justify-between h-full">
              <div>
                <b>{submission.name}</b> {submission.description}
              </div>
              <div className="flex items-center text-xl space-x-2">
                <div>{totalRating(submission.votes)}</div>
                <div>(Ø {avgRating(submission.votes)})</div>
                <FaStar size={20} />
              </div>
              <div>{submission.votes.length} vote(s)</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ViewPartyLeaderboard;
