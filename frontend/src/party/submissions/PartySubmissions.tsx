import { FaTrash } from 'react-icons/fa';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { deleteSubmission, getImageUrl, useParty, usePartyStatus, useUser } from '../../api';
import { PartySubmissionResponse } from '../../api-models';
import { useSession } from '../../user/session';

function PartySubmission({ partyId, partySubmission }: { partyId: string; partySubmission: PartySubmissionResponse }) {
  const [session] = useSession();
  const { mutateAsync } = useMutation(deleteSubmission);
  const { data: party, refetch } = useParty(partyId);
  const { data: partyStatus } = usePartyStatus(partyId);
  const { data: user } = useUser(partySubmission.userId);

  const deletionDisabled = partyStatus?.isLive || party?.done;

  const onDeleteSubmission = async () => {
    if (deletionDisabled) {
      return;
    }

    const result = window.confirm(`Are you sure you want to delete your submission ${partySubmission.name}?`);
    if (result) {
      toast.info(`Submission ${partySubmission.name} has been deleted`);
      await mutateAsync({
        partyId,
        sessionToken: session!.token,
        submissionId: partySubmission.id,
      });
      await refetch();
    }
  };

  return (
    <div className="p-4">
      <div className="bg-gray-100 w-96 rounded-lg">
        <img className="rounded w-full" src={getImageUrl(partySubmission.imageId)} alt={partySubmission.name} />
        <div className="p-6">
          <span className="flex space-x-4">
            <span className="font-bold mb-4">{partySubmission.name || '-'}</span>
            <span className="text-gray-700">by {user?.username}</span>
          </span>
          <p className="leading-relaxed text-base">{partySubmission.description}</p>
          {!deletionDisabled && (
            <button className="bg-red-800 hover:bg-red-400 text-white py-2 px-4 rounded" onClick={onDeleteSubmission}>
              <FaTrash />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PartySubmissions({
  partyId,
  partySubmissions,
}: {
  partyId: string;
  partySubmissions: PartySubmissionResponse[];
}) {
  return (
    <div className="flex flex-wrap -m-4">
      {partySubmissions.map((partySubmission) => (
        <PartySubmission key={partySubmission.id} partyId={partyId} partySubmission={partySubmission} />
      ))}
    </div>
  );
}

export default PartySubmissions;
