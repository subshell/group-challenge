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
      <div className="relative transition-all duration-500 bg-size-200 rounded-md dark:bg-slate-700 dark:text-white">
        {isLive && (
          <span className="bg-blue-500 text-white font-bold px-3 py-3 tracking-widest flex uppercase justify-between rounded-t-md">
            <span className="flex items-center space-x-2">
              <FaTv title="is live" />
              <span>live</span>
            </span>
            <a
              href={'/party/view/' + party.id}
              className="bg-white text-slate-900 px-12 py-1 rounded-md hover:bg-blue-500 hover:text-white hover:outline hover:outline-white"
            >
              Join
            </a>
          </span>
        )}
        <div
          className={isLive ? `border-4 border-t-0 border-blue-500 rounded-b-md` : 'border border-slate-500 rounded-md'}
        >
          <div className="relative mx-6 py-6 flex justify-between flex-col md:flex-row">
            <div className="max-w-7xl space-y-2">
              <div className="flex space-x-8 title-font font-medium tracking-widest">
                <div className="flex items-center space-x-2">
                  <FaCalendarDay />
                  <span>{formatRelative(new Date(party.endDate), new Date())}</span>
                </div>
                <div className="flex items-center space-x-2" title="moderator">
                  <FaUserAlt />
                  <span>{host?.username}</span>
                </div>
              </div>
              <h1 className="text-3xl tracking-tight md:text-2xl lg:text-3xl">
                <span className="font-bold">{party.name}</span>
              </h1>
              <p className="mt-6 max-w-3xl text-xl">{party.description}</p>
            </div>
            <div className="flex space-x-8">
              <div className="flex flex-col items-center p-2">
                <dt className="mb-2 text-3xl font-extrabold">{party.submissions.length}</dt>
                <dd className="font-light">submissions</dd>
              </div>
              <div>
                <a
                  href={'/party/my-submissions/' + party.id}
                  className="flex flex-col items-center hover:bg-white hover:text-cyan-500 rounded-md p-2"
                >
                  <dt className="mb-2 text-3xl font-extrabold">{numOwnSubmissions}</dt>
                  <dd className="font-light">my submissions</dd>
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 w-full border-t border-white p-4 mt-4 dark:border-slate-500">
            {isHost && <PartyHostMenu party={party} />}

            <a className="hover:underline font-bold" href={'/party/my-submissions/' + party.id}>
              Upload
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HighlightedParty;
