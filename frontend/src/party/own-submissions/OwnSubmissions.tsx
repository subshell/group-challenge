import { useParams } from 'react-router';
import { useParty } from '../../api';
import { PartyResponse } from '../../api-models';
import { useSession } from '../../user/session';
import PartySubmissions from '../edit/PartySubmissions';

function OwnSubmissions() {
  const [session] = useSession();
  const { id } = useParams<{ id: string }>();
  const { data: party, isError, isLoading } = useParty(id);

  if (isError) return <span>Error</span>;
  if (!party || isLoading) return <span>Loading</span>;

  const ownSubmissions = party!.submissions.filter((submission) => submission.userId === session?.userId);

  return (
    <div>
      <h1 className="text-2xl mb-8">My Submissions</h1>
      {ownSubmissions.length !== 0 ? (
        <PartySubmissions partyId={id} partySubmissions={ownSubmissions} />
      ) : (
        <span>No submissions...</span>
      )}
    </div>
  );
}

export default OwnSubmissions;
