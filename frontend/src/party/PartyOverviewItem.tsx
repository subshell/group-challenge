import { FaArrowRight, FaCameraRetro, FaEdit, FaTv } from 'react-icons/fa';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { getThumbnailUrl, reopenParty, startParty, usePartyStatus } from '../api/api';
import { isPartyLive, PartyResponse } from '../api/api-models';
import { useSession } from '../user/session';

function PartiesOverviewItem({ party, onPartyChange }: { party: PartyResponse; onPartyChange?: () => any }) {
  const [session] = useSession();
  const partyStatus = usePartyStatus(party.id);
  const { mutateAsync: startMutateAsync } = useMutation(startParty);
  const { mutateAsync: reopenPartyMutateAsync } = useMutation(reopenParty);
  const navigate = useNavigate();

  const isLive = partyStatus.isSuccess && isPartyLive(partyStatus.data);
  const isHost = party?.userId === session?.userId;

  const onReopenPartyButton = async () => {
    if (!isHost || !party?.done) {
      return;
    }

    const result = window.confirm('Are you sure you want to reopen the party? This will reset all votes!');
    if (!result) {
      return;
    }

    await reopenPartyMutateAsync({ partyId: party.id, sessionToken: session!.token });
    onPartyChange?.();
  };

  const onStartPartyButton = async () => {
    if (!isHost || isLive) {
      return;
    }

    await startMutateAsync({ partyId: party.id, sessionToken: session!.token });
    onJoinPartyButton();
  };

  const onJoinPartyButton = async () => {
    navigate('/party/view/' + party.id);
  };

  const onEditButton = () => {
    if (!isHost) {
      return;
    }
    navigate('/party/edit/' + party.id);
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
          <FaTv title="is live" /> <span>live</span>
        </span>
      )}
      <div
        className={`h-full rounded-lg border-2 shadow-md hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden space-y-4
        ${isLive && 'border-blue-500 bg-blue-100'}
        ${party.done && 'bg-gray-200'}`}
      >
        {party.done && party.submissions.length !== 0 && (
          <img src={getThumbnailUrl(party.submissions[0]?.imageId)} alt={party.name} className="fit" />
        )}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-sm tracking-widest title-font font-medium">
                {new Date(party.startDate).toLocaleDateString()} - {new Date(party.endDate).toLocaleDateString()}
              </h2>
              {isHost && !isLive && (
                <button
                  className="flex rounded-full text-white bg-blue-500 hover:bg-blue-400 px-3 py-1 text-xs font-bold"
                  onClick={() => (party.done ? onReopenPartyButton() : onStartPartyButton())}
                >
                  {party.done ? 'Reopen' : 'Go Live'}
                </button>
              )}
            </div>

            <h1 className="text-xl text-gray-900 pb-2">
              <span>{party.name}</span>
            </h1>

            <span className="text-xs text-gray-600">{party.description}</span>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="space-y-2">
            {!party.done && (
              <button
                onClick={onJoinPartyButton}
                className={`
                flex items-center mt-auto text-white border-0 py-2 px-4 w-full focus:outline-none rounded
                ${isLive ? 'bg-blue-500 hover:opacity-75' : 'bg-blue-200 cursor-default'}
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
                  className="flex place-items-center space-x-2 text-blue-700 hover:opacity-75 cursor-pointer"
                >
                  <span>Leaderboard</span>
                  <FaArrowRight />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-start text-sm text-gray-600 font-bold border-t border-gray-500 pt-4">
            <div className="flex flex-col space-y-2">
              {!party.done && !isLive ? (
                <button
                  onClick={onSubmissionsButton}
                  className="flex place-items-center space-x-2 text-blue-700 hover:opacity-75 font-bold"
                >
                  <span>My Submissions</span>
                  <FaArrowRight />
                </button>
              ) : (
                <span className="italic">closed for submissions</span>
              )}{' '}
              <span className="flex items-center space-x-2 tracking-widest">
                <FaCameraRetro />
                <span>{party.submissions.length}</span>
              </span>
            </div>
            {isHost && (
              <button
                onClick={onEditButton}
                className="flex place-items-center space-x-2 text-blue-700 hover:opacity-75 font-bold"
              >
                <span>Edit</span>
                <FaEdit />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartiesOverviewItem;
