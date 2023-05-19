import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { deleteParty, editParty, assignModerator, useParty, reopenParty } from '../../api/api';
import { PartyResponse } from '../../api/api-models';
import { useSession } from '../../user/session';
import PartyForm, { PartyFormData } from '../PartyForm';
import PartySubmissions from '../submissions/PartySubmissions';
import ElectNewModeratorForm, { ElectNewModeratorFormData } from './ElectNewModeratorForm';

function EditParty() {
  const [session] = useSession();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: party, isError, isLoading } = useParty(id as string);
  const { mutateAsync: mutatePartyAsync } = useMutation(editParty);
  const { mutateAsync: mutateNewModeratorAsync } = useMutation(assignModerator);
  const { mutateAsync: reopenPartyMutateAsync } = useMutation(reopenParty);
  const deletePartyMutation = useMutation(deleteParty);
  const isHost = party?.userId === session?.userId;

  const onDeleteBtn = async () => {
    const result = window.confirm(`Are you sure you want to delete ${party?.name}`);
    if (result) {
      toast.info(`Party ${party?.name} has been deleted`);
      deletePartyMutation.mutate({ partyId: id as string, sessionToken: session!.token });
      navigate('/');
    }
  };

  const onReopenPartyButton = async () => {
    if (!isHost || !party?.done) {
      return;
    }

    const result = window.confirm('Are you sure you want to reopen the party? This will reset all votes!');
    if (!result) {
      return;
    }

    await reopenPartyMutateAsync({ partyId: party.id, sessionToken: session!.token });
  };

  const onSubmit = async (partyFormData: PartyFormData) => {
    toast.success(`party '${partyFormData.name}' edited 😁`);
    await mutatePartyAsync({ party: partyFormData, partyId: id as string, sessionToken: session!.token });
    navigate('/');
  };

  const onChangeModerator = async (data: ElectNewModeratorFormData) => {
    const result = window.confirm('Are you sure you want to elect a new moderator?');
    if (!result) {
      return;
    }

    const response = await mutateNewModeratorAsync({
      partyId: id as string,
      sessionToken: session!.token,
      userId: data.new_moderator,
    });
    if (response.status === 200) {
      toast.success(`${party?.name} has a new moderator!`);
      navigate('/');
    } else {
      toast.error(`something went wrong: ${response.status} ${response.statusText}!`);
    }
  };

  useEffect(() => {
    if (!party && isError) {
      navigate('/');
    }
  }, [party, isError, navigate]);

  if (isError) return <span>Error</span>;
  if (!party || isLoading) return <span>Loading</span>;

  const initialPartyFormData: Partial<PartyResponse> = {
    ...party,
    startDate: new Date(party!.startDate).toISOString().split('T')[0],
    endDate: new Date(party!.endDate).toISOString().split('T')[0],
  };

  if (!id) {
    return <div>No party id provided</div>;
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex w-full place-content-between">
        <h1 className="text-2xl">Edit Party</h1>
        <div className="flex space-x-2">
          {party?.done && (
            <button
              onClick={onReopenPartyButton}
              className="bg-blue-800 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
            >
              Reopen
            </button>
          )}
          <button className="bg-red-800 hover:bg-red-500 text-white font-bold py-2 px-4 rounded" onClick={onDeleteBtn}>
            Delete
          </button>
        </div>
      </div>
      <div className="border p-4 bg-white rounded dark:bg-slate-600 dark:border-slate-500">
        <h3 className="text-xl mb-8">Party Settings</h3>
        <PartyForm onSubmit={onSubmit} initialData={initialPartyFormData} />
      </div>
      <div className="border p-4 bg-white rounded dark:bg-slate-600 dark:border-slate-500">
        <h3 className="text-xl mb-8">Advanced Settings</h3>
        <ElectNewModeratorForm onSubmit={onChangeModerator} />
      </div>
      <div className="border p-4 bg-white rounded dark:bg-slate-600 dark:border-slate-500">
        <h3 className="text-xl mb-8">Submissions</h3>
        <PartySubmissions partyId={id} partySubmissions={party!.submissions} />
      </div>
    </div>
  );
}

export default EditParty;
