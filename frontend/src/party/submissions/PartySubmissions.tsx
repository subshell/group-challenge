import { FaEdit, FaSave, FaTrash } from 'react-icons/fa';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { deleteSubmission, editSubmission, getImageUrl, getThumbnailUrl, useParty, usePartyStatus, useUser } from '../../api/api';
import {isPartyLive, PartySubmissionEditFormData, PartySubmissionResponse} from '../../api/api-models';
import { useSession } from '../../user/session';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

//todo this is also used on editParty -> prevent edit there
function PartySubmission({ partyId, partySubmission, editSubmissionsDisabled }: { partyId: string; partySubmission: PartySubmissionResponse; editSubmissionsDisabled?: boolean }) {
  const [session] = useSession();
  const { mutateAsync: deleteAsync } = useMutation({ mutationFn: deleteSubmission });
  const { mutateAsync: editAsync } = useMutation({ mutationFn: editSubmission });
  const { data: party, refetch } = useParty(partyId);
  const { data: partyStatus } = usePartyStatus(partyId);
  const { data: user } = useUser(partySubmission.userId);
  const form = useForm<PartySubmissionEditFormData>({
    defaultValues: { name: partySubmission.name, description: partySubmission.description },
  });

  const deletionDisabled = isPartyLive(partyStatus) || party?.done;
  const editDisabled = editSubmissionsDisabled || isPartyLive(partyStatus) || party?.done;
  const [editMode, setEditMode] = useState(false);

  const onDeleteSubmission = async () => {
    if (deletionDisabled) {
      return;
    }

    const result = window.confirm(`Are you sure you want to delete your submission ${partySubmission.name}?`);
    if (result) {
      toast.info(`Submission ${partySubmission.name} has been deleted`);
      await deleteAsync({
        partyId,
        sessionToken: session!.token,
        submissionId: partySubmission.id,
      });
      await refetch();
    }
  };

  const onEditSubmission = async () => {
    if (editDisabled) {
      return;
    }
    form.reset({ name: partySubmission.name, description: partySubmission.description });
    setEditMode(true);
  }

  const onSaveSubmission = async (data: PartySubmissionEditFormData) => {
    if (editDisabled) {
      return;
    }
    await editAsync({
      partyId,
      sessionToken: session!.token,
      submissionId: partySubmission.id,
      submission: data
    });
    await refetch();
    setEditMode(false);
  }

  return (
    <div className="p-4">
      <div className="bg-white w-96 rounded-lg border dark:bg-slate-900">
        <a
          href={getImageUrl(partySubmission.imageId)}
          target="_blank"
          rel="noopener noreferrer"
          title="open image in new tab"
        >
          <img className="rounded w-full" src={getThumbnailUrl(partySubmission.imageId)} alt={partySubmission.name} />
        </a>
        <div className="p-6">
            {!editMode && (
              <div>
                <span className="flex space-x-4">
                  <span className="font-bold mb-1">{partySubmission.name || '-'}</span>
                  <span className="text-gray-500">by {user?.username}</span>
                </span>
                <p className="leading-relaxed text-base mb-4">{partySubmission.description}</p>
              </div>
            )}
          {!editDisabled && editMode && (
              <form className="space-y-4" onSubmit={form.handleSubmit(onSaveSubmission)}>
                <label className="block text-sm font-bold mb-2" htmlFor="name">
                  Image Title <span className="text-gray-500">(optional)</span>
                </label>
                <input className="bg-white shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-black focus:border-blue-400 focus:outline-hidden transition-colors"
                       placeholder="Enter a title" {...form.register('name')} />
                <label className="block text-sm font-bold mb-2" htmlFor="description">
                  Image Description <span className="text-gray-500">(optional)</span>
                </label>
                <input className="bg-white shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-black focus:border-blue-400 focus:outline-hidden transition-colors"
                       placeholder="Enter a description" {...form.register('description')} />
                <button data-element="save-submission" className="cursor-pointer ml-2 bg-gray-600 hover:bg-gray-400 text-white py-2 px-2 rounded" type="submit">
                  <FaSave />
                </button>
              </form>
          )}
          {!deletionDisabled && !editMode && (
            <button data-element="delete-submission" className="cursor-pointer bg-red-800 hover:bg-red-400 text-white py-2 px-2 rounded" onClick={onDeleteSubmission}>
              <FaTrash />
            </button>
          )}
          {!editDisabled && !editMode && (
          <button data-element="edit-submission" className="cursor-pointer ml-2 bg-gray-600 hover:bg-gray-400 text-white py-2 px-2 rounded" onClick={onEditSubmission}>
            <FaEdit />
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
  editSubmissionDisabled
}: {
  partyId: string;
  partySubmissions: PartySubmissionResponse[];
  editSubmissionDisabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap -m-4">
      {partySubmissions.map((partySubmission) => (
        <PartySubmission key={partySubmission.id} partyId={partyId} partySubmission={partySubmission} editSubmissionsDisabled={editSubmissionDisabled} />
      ))}
    </div>
  );
}

export default PartySubmissions;
