import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { useParty } from '../../api';
import { PartyResponse } from '../../api-models';
import PartyForm, { PartyFormData } from '../PartyForm';
import PartySubmissions from './PartySubmissions';

function EditParty() {
  const { id } = useParams<{ id: string }>();
  const { data: party, isError, isLoading } = useParty(id);
  const onSubmit = async (partyFormData: PartyFormData) => {
    toast(`party '${partyFormData.name}' edited 😁`, { type: 'success' });
    console.log(partyFormData);
  };

  if (isError) return <span>Error</span>;
  if (!party || isLoading) return <span>Loading</span>;

  const initialPartyFormData: Partial<PartyResponse> = {
    ...party,
    startDate: new Date(party!.startDate).toISOString().split('T')[0],
    endDate: new Date(party!.endDate).toISOString().split('T')[0],
  };

  // test
  party.submissions = [
    {
      id: '123123',
      imageURL: 'https://dummyimage.com/720x400',
      name: 'my name',
      user: {
        id: '',
        username: 'Tom',
        email: 'tom@tom.de',
      },
      submissionDate: new Date().toLocaleTimeString(),
    },
  ];

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
