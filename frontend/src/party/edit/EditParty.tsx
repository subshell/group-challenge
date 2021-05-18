import { useEffect } from 'react';
import { useMutation } from 'react-query';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { deleteParty, editParty, useParty } from '../../api/api';
import { PartyResponse } from '../../api/api-models';
import { useSession } from '../../user/session';
import PartyForm, { PartyFormData } from '../PartyForm';
import PartySubmissions from '../submissions/PartySubmissions';

function EditParty() {
  const [session] = useSession();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { data: party, isError, isLoading } = useParty(id);
  const { mutateAsync: mutatePartyAsync } = useMutation(editParty);
  const deletePartyMutation = useMutation(deleteParty);

  const onDeleteBtn = async () => {
    const result = window.confirm(`Are you sure you want to delete ${party?.name}`);
    if (result) {
      toast.info(`Party ${party?.name} has been deleted`);
      await deletePartyMutation.mutate({ partyId: id, sessionToken: session!.token });
      history.push('/');
    }
  };

  const onSubmit = async (partyFormData: PartyFormData) => {
    toast.success(`party '${partyFormData.name}' edited 😁`);
    await mutatePartyAsync({ party: partyFormData, partyId: id, sessionToken: session!.token });
    history.push('/');
  };

  useEffect(() => {
    if (!party && isError) {
      history.push('/');
    }
  }, [party, isError, history]);

  if (isError) return <span>Error</span>;
  if (!party || isLoading) return <span>Loading</span>;

  const initialPartyFormData: Partial<PartyResponse> = {
    ...party,
    startDate: new Date(party!.startDate).toISOString().split('T')[0],
    endDate: new Date(party!.endDate).toISOString().split('T')[0],
  };

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
      <div className="mb-8">
        <PartyForm onSubmit={onSubmit} initialData={initialPartyFormData} />
      </div>
      <h3 className="text-xl mb-8">Submissions</h3>
      <PartySubmissions partyId={id} partySubmissions={party!.submissions} />
    </div>
  );
}

export default EditParty;
