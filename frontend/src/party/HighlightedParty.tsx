import { formatRelative } from 'date-fns';
import { FaCalendarDay, FaTv, FaUserAlt } from 'react-icons/fa';
import { usePartyStatus, useUser } from '../api/api';
import { isPartyLive, PartyResponse } from '../api/api-models';
import { useSession } from '../user/session';
import { PartyHostMenu } from './PartyHostMenu';

function HighlightedParty({ party }: { party: PartyResponse }) {
  const partyStatus = usePartyStatus(party.id);
  const [session] = useSession();
  const { data: host } = useUser(party.userId);

  const isLive = partyStatus.isSuccess && isPartyLive(partyStatus.data);
  const isHost = party?.userId === session?.userId;
  const numOwnSubmissions = party.submissions.filter((submission) => submission.userId === session?.userId).length;

  return (
    <div>
      <div className="relative space-y-2 pb-8 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 bg-size-200 bg-pos-0 hover:bg-pos-100 rounded-md">
        {isLive && (
          <span className="bg-slate-600 text-white px-3 py-3 tracking-widest text-sm flex uppercase justify-between rounded-tl-md rounded-tr-md">
            <span className="flex items-center space-x-2">
              <FaTv title="is live" />
              <span>live</span>
            </span>
            <a href={'/party/view/' + party.id} className="bg-cyan-500 px-12 py-1 rounded-md hover:bg-cyan-400">
              Join
            </a>
          </span>
        )}

        <div className="relative mx-6 py-6 text-white flex justify-between">
          <div className="max-w-7xl space-y-2">
            <div className="flex space-x-4">
              {isHost && <PartyHostMenu party={party} />}
              <div className="flex items-center space-x-4">
                <FaCalendarDay className="text-xl" />
                <span>{formatRelative(new Date(party.endDate), new Date())}</span>
              </div>
              <div className="flex items-center space-x-4">
                <FaUserAlt className="text-xl" />
                <span>{host?.username}</span>
              </div>
            </div>
            <h1 className="text-3xl tracking-tight md:text-2xl lg:text-3xl">
              <span className="font-extrabold">{party.name}</span>
            </h1>
            <p className="mt-6 max-w-3xl text-xl">{party.description}</p>
          </div>
          <div className="flex">
            <div className="flex flex-col items-center">
              <dt className="mb-2 text-3xl font-extrabold">{party.submissions.length}</dt>
              <dd className="font-light dark:text-gray-400">submissions</dd>
            </div>
          </div>
        </div>

        <div className="relative max-w-sm text-white">
          <a
            className="flex items-center mt-auto bg-white hover:text-white hover:bg-slate-900 text-slate-900 text-sm py-4 px-4 w-full font-bold"
            href={'/party/my-submissions/' + party.id}
          >
            My Submissions ({numOwnSubmissions})
          </a>
        </div>
      </div>
    </div>
  );
}

export default HighlightedParty;
