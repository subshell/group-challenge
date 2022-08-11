import { usePartyStatus, useUser } from '../../api/api';
import { isPartyLive, PartyResponse } from '../../api/api-models';
import { PartyHostMenu } from '../PartyHostMenu';

function PartyListRow({ party }: { party: PartyResponse }) {
  const partyStatus = usePartyStatus(party.id);
  const { data: moderator } = useUser(party.userId);

  const partyId = party.id;
  const isLive = partyStatus.isSuccess && isPartyLive(partyStatus.data);
  party.submissions = party?.submissions ?? [];

  return (
    <tr key={party.id} className="hover:bg-slate-500 text-gray-500 hover:text-white text-sm py-4">
      <td className="font-medium py-4">
        <a href={'/party/my-submissions/' + partyId} className="no-underline hover:underline font-medium text-sm pl-2">
          {party.name}
        </a>
      </td>
      <td>{new Date(party.startDate).toLocaleDateString()}</td>
      <td>{new Date(party.endDate).toLocaleDateString()}</td>
      <td>
        <a href={'/party/my-submissions/' + partyId} className="no-underline hover:underline font-medium text-sm">
          {party.submissions?.length}
        </a>
      </td>
      <td>{!party.done && !isLive ? 'yes' : 'no'}</td>
      <td>{isLive ? 'yes' : 'no'}</td>
      <td>{moderator?.username || '...'}</td>

      <td>{party.userId === moderator?.id && <PartyHostMenu party={party} />}</td>
    </tr>
  );
}

export default PartyListRow;
