import { useMutation } from 'react-query';
import { createParty } from '../../api/api';
import { useSession } from '../../user/session';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import PartyForm, { PartyFormData } from '../PartyForm';

function CreateParty() {
  const [session] = useSession();
  const { mutateAsync } = useMutation(createParty);
  const navigate = useNavigate();
  const onSubmit = async (data: PartyFormData) => {
    const party = await mutateAsync({ party: data, sessionToken: session!.token });
    toast(`new party '${party.name}' created 🥳`, { type: 'success' });
    navigate('/');
  };

  return (
    <div>
      <h1 className="text-2xl mb-8">Create Party</h1>
      <PartyForm onSubmit={onSubmit} submitBtnText="Create Party" />
    </div>
  );
}

export default CreateParty;
