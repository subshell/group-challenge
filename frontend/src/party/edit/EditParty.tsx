import { useMutation } from 'react-query';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { editParty, useParty } from '../../api';
import { PartyResponse } from '../../api-models';
import { useSession } from '../../user/session';
import PartyForm, { PartyFormData } from '../PartyForm';
import PartySubmissions from './PartySubmissions';

function EditParty() {
  const [session] = useSession();
  const { id } = useParams<{ id: string }>();
  const { data: party, isError, isLoading } = useParty(id);
  const { mutateAsync } = useMutation(editParty);
  const onSubmit = async (partyFormData: PartyFormData) => {
    const party = await mutateAsync({ party: partyFormData, partyId: id, sessionToken: session!.token });
    toast(`party '${party.name}' edited 😁`, { type: 'success' });
  };

  if (isError) return <span>Error</span>;
  if (!party || isLoading) return <span>Loading</span>;

  const initialPartyFormData: Partial<PartyResponse> = {
    ...party,
    startDate: new Date(party!.startDate).toISOString().split('T')[0],
    endDate: new Date(party!.endDate).toISOString().split('T')[0],
  };

  return (
    <div>
      <h1 className="text-2xl mb-8">Edit Party</h1>
      <div className="mb-8">
        <PartyForm onSubmit={onSubmit} initialData={initialPartyFormData} />
      </div>
      <h3 className="text-xl mb-8">Submissions</h3>
      <PartySubmissions partySubmissions={party!.submissions} />
    </div>
  );
}

export default EditParty;
