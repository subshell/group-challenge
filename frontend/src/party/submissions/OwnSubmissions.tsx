import { useParams } from 'react-router';
import { useParty, usePartyStatus } from '../../api/api';
import { isPartyLive } from '../../api/api-models';
import { useSession } from '../../user/session';
import PartySubmissions from './PartySubmissions';
import PostPartySubmission from './PostPartySubmission';

function OwnSubmissions() {
  const [session] = useSession();
  const { id } = useParams<{ id: string }>();
  const { data: party, isError, isLoading, refetch } = useParty(id as string);
  const { data: partyStatus } = usePartyStatus(id as string);
  if (isError) return <span>Error</span>;
  if (!party || isLoading) return <span>Loading</span>;

  const ownSubmissions = party!.submissions.filter((submission) => submission.userId === session?.userId);

  if (!id) {
    return <div>No party id provided</div>;
  }

  return (
    <div className="space-y-20">
      {party.done || isPartyLive(partyStatus) ? (
        <div className="text-2xl text-red-600">Party {party.name} is closed for submissions</div>
      ) : (
        <PostPartySubmission party={party} afterUpload={refetch} />
      )}
      <div>
        <h1 className="text-2xl mb-8">My Submissions</h1>
        {ownSubmissions.length !== 0 ? (
          <PartySubmissions partyId={id} partySubmissions={ownSubmissions} />
        ) : (
          <span>No submissions...</span>
        )}
      </div>
    </div>
  );
}

export default OwnSubmissions;
