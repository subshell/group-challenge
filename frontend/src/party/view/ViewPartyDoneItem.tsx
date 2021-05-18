import { FaCrown, FaStar } from 'react-icons/fa';
import { getImageUrl } from '../../api/api';
import { PartyResponse, PartySubmissionResponse } from '../../api/api-models';

function ViewPartyDoneItem({ party }: { party: PartyResponse }) {
  const totalRating = (submission: PartySubmissionResponse) => submission.votes.reduce((x1, x2) => x1 + x2.rating, 0);

  const sortedSubmissions = party.submissions.sort((a, b) => {
    return totalRating(b) - totalRating(a);
  });

  return (
    <section className="text-gray-600 body-font">
      <div className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3" role="alert">
        <p>Party is over! Here are the results...</p>
      </div>
      <div className="space-y-4">
        {sortedSubmissions.map((submission, i) => (
          <div className="flex items-center justify-items-center space-x-4 space-y-4" key={submission.id}>
            <div className="text-4xl mr-8">{i + 1}.</div>
            <div>{i === 0 && <FaCrown size={64} />}</div>
            <div className="flex items-center">
              <img
                className="object-contain w-96 h-60 rounded"
                src={getImageUrl(submission.imageId)}
                alt={submission.name}
              />
            </div>
            <div className="flex flex-col justify-between h-full">
              <div>
                <b>{submission.name}</b> {submission.description}
              </div>
              <div className="flex items-center text-xl space-x-2">
                <div>{totalRating(submission)}</div> <FaStar size={20} />
              </div>
              <div>{submission.votes.length} votes</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ViewPartyDoneItem;
