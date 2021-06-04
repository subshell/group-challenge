import { FaMedal, FaStar } from 'react-icons/fa';
import { getImageUrl } from '../../api/api';
import { PartyResponse } from '../../api/api-models';
import { ReactComponent as Trophy } from './rewards/trophy.svg';
import { totalRating, avgRating, sortSubmissions } from './util';

function ViewPartyLeaderboard({ party }: { party: PartyResponse }) {
  const sortedSubmissions = sortSubmissions(party.submissions);

  return (
    <section className="text-gray-600 body-font">
      <div className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3" role="alert">
        <p>Party is over! Here are the results...</p>
      </div>
      <div className="space-y-4">
        {sortedSubmissions.map((submission, i) => (
          <div className="flex items-center justify-items-center space-x-4 space-y-4" key={submission.id}>
            {i === 0 && <Trophy />}
            {i === 1 && <FaMedal size={48} color="silver" />}
            {i === 2 && <FaMedal size={48} color="brown" />}
            {i > 2 && <div className="text-4xl mr-5">{i + 1}.</div>}
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
                <div>{totalRating(submission)}</div>
                <div>(Ø {avgRating(submission)})</div>
                <FaStar size={20} />
              </div>
              <div>{submission.votes.length} votes</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ViewPartyLeaderboard;
