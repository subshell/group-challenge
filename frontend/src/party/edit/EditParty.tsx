import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { deleteParty, editParty, assignModerator, useParty } from '../../api/api';
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
  const deletePartyMutation = useMutation(deleteParty);

  const onDeleteBtn = async () => {
    const result = window.confirm(`Are you sure you want to delete ${party?.name}`);
    if (result) {
      toast.info(`Party ${party?.name} has been deleted`);
      await deletePartyMutation.mutate({ partyId: id as string, sessionToken: session!.token });
      navigate('/');
    }
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
    <div>
      <div className="flex w-full place-content-between">
        <h1 className="text-2xl mb-8">Edit Party</h1>
        <div>
          <button className="bg-red-800 hover:bg-red-500 text-white font-bold py-2 px-4 rounded" onClick={onDeleteBtn}>
            Delete
          </button>
        </div>
      </div>
      <div className="mb-8 border p-4 bg-white">
        <h3 className="text-xl mb-8">Party Settings</h3>
        <PartyForm onSubmit={onSubmit} initialData={initialPartyFormData} />
      </div>
      <div className="mb-8 border p-4 bg-white">
        <h3 className="text-xl mb-8">Advanced Settings</h3>
        <ElectNewModeratorForm onSubmit={onChangeModerator} />
      </div>
      <div className="mb-8 border p-4 bg-white">
        <h3 className="text-xl mb-8">Submissions</h3>
        <PartySubmissions partyId={id} partySubmissions={party!.submissions} />
      </div>
    </div>
  );
}

export default EditParty;
