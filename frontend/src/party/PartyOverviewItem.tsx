import { formatRelative } from 'date-fns';
import { FaArrowRight, FaCalendarDay, FaCameraRetro, FaTv, FaUserAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { getThumbnailUrl, usePartyStatus, useUser } from '../api/api';
import { isPartyLive, PartyResponse } from '../api/api-models';
import { useSession } from '../user/session';
import { PartyHostMenu } from './PartyHostMenu';

function PartiesOverviewItem({ party }: { party: PartyResponse }) {
  const [session] = useSession();
  const partyStatus = usePartyStatus(party.id);
  const navigate = useNavigate();
  const { data: host } = useUser(party.userId);

  const isLive = partyStatus.isSuccess && isPartyLive(partyStatus.data);
  const isHost = party?.userId === session?.userId;

  const onJoinPartyButton = async () => {
    navigate('/party/view/' + party.id);
  };

  const onSubmissionsButton = () => {
    if (party?.done) {
      return;
    }
    navigate('/party/my-submissions/' + party.id);
  };

  const onLeaderboardButton = () => {
    navigate('/party/view/' + party.id);
  };

  party.submissions = party?.submissions ?? [];

  return (
    <div className="p-4 w-full relative">
      {isLive && (
        <span className="bg-blue-500 text-white px-3 py-1 tracking-widest text-xs absolute flex items-center space-x-2 right-4 top-4 rounded-bl rounded-tr uppercase">
          <FaTv title="live" /> <span>live</span>
        </span>
      )}
      {party.done && (
        <span className="bg-red-700 dark:bg-red-500 text-white px-3 py-1 tracking-widest text-xs absolute flex items-center space-x-2 right-4 top-4 rounded-bl rounded-tr uppercase">
          <span>closed</span>
        </span>
      )}
      <div
        className={`h-full rounded-lg border-2 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-4 dark:text-white dark:bg-slate-700
        ${isLive ? 'border-blue-500' : party.done ? 'border-red-700 dark:border-red-500' : 'border-slate-500'}`}
      >
        {party.done && party.submissions.length !== 0 && (
          <img src={getThumbnailUrl(party.submissions[0]?.imageId)} alt={party.name} className="fit" />
        )}
        <div className="p-6">
          <div className="space-y-4">
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

            <h1 className="text-xl font-extrabold">
              <span>{party.name}</span>
            </h1>

            <span className="text-xs">{party.description}</span>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="space-y-2">
            {!party.done && (
              <button
                onClick={onJoinPartyButton}
                className={`
                flex items-center mt-auto text-white border-0 py-2 px-4 w-full focus:outline-none rounded
                ${isLive ? 'bg-blue-500 hover:opacity-75' : 'bg-blue-300 cursor-default'}
              `}
                disabled={!isLive}
              >
                Join
                <FaArrowRight className="ml-auto" />
              </button>
            )}

            {party.done && (
              <div>
                <button
                  onClick={onLeaderboardButton}
                  className="flex place-items-center space-x-2 text-blue-500 hover:opacity-75 cursor-pointer"
                >
                  <span>Leaderboard</span>
                  <FaArrowRight />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-sm border-t border-slate-500 pt-4">
            {isHost && <PartyHostMenu party={party} />}

            {!party.done && !isLive && (
              <button
                onClick={onSubmissionsButton}
                className="flex place-items-center space-x-2 font-bold hover:underline dark:text-white"
              >
                <span>Upload</span>
              </button>
            )}
            <span className="flex items-center space-x-2 tracking-widest">
              <FaCameraRetro />
              <span>{party.submissions.length}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartiesOverviewItem;
