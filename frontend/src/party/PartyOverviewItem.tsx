import { getThumbnailUrl } from '../api/api';
import { PartyResponse } from '../api/api-models';
import { sortSubmissions } from './view/util';
import { Link } from 'react-router-dom';

function PartyOverviewItem({ party }: { party: PartyResponse }) {
  if (!party.done) {
    return <>{party.name} is still open</>;
  }

  party.submissions = party?.submissions ?? [];

  const submissions = sortSubmissions(party.submissions);

  return (
    <div className="relative">
      <div className="flex space-x-8">
        <div className="flex items-center space-x-2 mb-4">
          <Link
            to={'/party/view/' + party.id}
            className="flex place-items-center space-x-2 text-blue-500 hover:opacity-75 cursor-pointer"
          >
            <span>
              {party.name} ({submissions.length} photo{submissions.length !== 1 && 's'})
            </span>
          </Link>
        </div>
      </div>
      <div className="flex flex-row space-x-2 h-48 overflow-auto">
        {submissions.slice(0, 3).map((submission) => (
          <div key={submission.id} className="shrink-0 shadow-md hover:shadow-lg">
            <img src={getThumbnailUrl(submission?.imageId)} alt={submission?.name} className="h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PartyOverviewItem;
