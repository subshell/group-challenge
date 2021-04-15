import { useEffect } from 'react';
import { FaTv } from 'react-icons/fa';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router';
import { startParty, useParty, usePartyStatus } from '../api';
import Button from '../components/Button';
import LinkButton from '../components/LinkButton';
import { useSession } from '../user/session';

function PartiesOverviewItem({ partyId }: { partyId: string }) {
  const [session] = useSession();
  const { data: party, isError, isLoading, refetch: refetchParty } = useParty(partyId);
  const partyStatus = usePartyStatus(partyId);
  const { mutateAsync: startMutateAsync } = useMutation(startParty);
  const history = useHistory();
  const onStartPartyButton = async () => {
    await startMutateAsync({ partyId: partyId, sessionToken: session!.token });
    history.push('/party/view/' + partyId);
  };
  const onJoinPartyButton = async () => {
    history.push('/party/view/' + partyId);
  };

  const isLive = partyStatus.isSuccess && partyStatus.data.isLive;

  useEffect(() => {
    refetchParty();
  }, [refetchParty, isLive]);

  if (isError) return <span>ERROR</span>;
  if (isLoading || !party) return <span>LOADING</span>;

  return (
    <div
      className={`border border-gray-200 py-8 px-8 flex flex-col flex-wrap md:flex-nowrap ${
        party.done ? 'opacity-75 bg-gray-300' : ''
      }${isLive ? 'bg-green-700 text-white' : ''}`}
    >
      <h2 className="text-2xl font-medium title-font mb-2 flex flex-row justify-between">
        {party.name} {isLive && <FaTv title="is live" />}
      </h2>
      <p>
        <span className="text-sm">
          {new Date(party.startDate).toLocaleDateString()} - {new Date(party.endDate).toLocaleDateString()}
        </span>
      </p>

      <p className="leading-relaxed">{party.description}</p>
      <div className="flex justify-between mt-2">
        <div className="space-x-2">
          {(party.done || isLive) && <Button onClick={onJoinPartyButton}>{party.done ? 'See Results' : 'Join'}</Button>}
          {!party.done && !isLive && <LinkButton to={'/party/post/' + party.id} text="Add Submission" />}
          <LinkButton to={'/party/my-submissions/' + party.id} text="My Submissions" />
        </div>

        {session!.userId === party.userId && (
          <div className="space-x-2">
            <LinkButton to={'/party/edit/' + party.id} text="Edit" />
            {!isLive && <Button onClick={onStartPartyButton}>{party.done ? 'Restart Party' : 'Start Party'}</Button>}
          </div>
        )}
      </div>
    </div>
  );
}

export default PartiesOverviewItem;
