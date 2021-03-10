import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { PartyResponse, useParty } from '../../api';
import PartyForm, { PartyFormData } from '../PartyForm';

function EditParty() {
  const { id } = useParams<{ id: string }>();
  const { data: party, isError, isLoading } = useParty(id);
  const onSubmit = async (partyFormData: PartyFormData) => {
    toast(`party '${partyFormData.name}' edited 😁`, { type: 'success' });
    console.log(partyFormData);
  };

  if (isError) return <span>Error</span>;
  if (isLoading) return <span>Loading</span>;

  const initialPartyFormData: Partial<PartyResponse> = {
    ...party,
    startDate: new Date(party!.startDate).toISOString().split('T')[0],
    endDate: new Date(party!.endDate).toISOString().split('T')[0],
  };

  return (
    <div>
      <h1 className="text-2xl mb-8">Edit Party</h1>
      <PartyForm onSubmit={onSubmit} initialData={initialPartyFormData} />
    </div>
  );
}

export default EditParty;
