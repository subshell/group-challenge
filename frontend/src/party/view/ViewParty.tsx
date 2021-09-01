import { useCallback, useEffect } from 'react';
import { useHistory, useParams } from 'react-router';
import {
  joinParty,
  nextPartySubmissions,
  previousPartySubmissions,
  useParty,
  usePartyStatus,
  votePartySubmissions,
} from '../../api/api';
import ViewPartySubmission from './ViewPartySubmission';
import ViewPartyLeaderboard from './ViewPartyLeaderboard';
import { PartyResponse, PartyStatusResponse } from '../../api/api-models';
import Button from '../../components/Button';
import { useMutation } from 'react-query';
import { useSession } from '../../user/session';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import ViewPartyStartPage from './ViewPartyStartPage';
import ViewPartyReveal from './ViewPartyReveal';
import EmojiBar from '../../components/EmojiBar';

const ViewPartyContent = ({
  partyStatus,
  isHost,
  party,
  onRating,
  onNextButton,
  onRedirect,
}: {
  partyStatus: PartyStatusResponse;
  isHost: boolean;
  party: PartyResponse;
  onRating: (rating: number) => any;
  onNextButton: () => any;
  onRedirect: () => any;
}) => {
  if (!partyStatus || !party) {
    return <div>Unknown party or party status</div>;
  }

  if (party.done || partyStatus.state === 'done') {
    return <ViewPartyLeaderboard party={party} />;
  }

  if (partyStatus.state === 'open') {
    onRedirect();
    return null;
  }

  if (partyStatus.state === 'waitinglobby') {
    return <ViewPartyStartPage isHost={isHost} participants={partyStatus.participants} onPartyStart={onNextButton} />;
  }

  if (partyStatus.state === 'submissions') {
    const partySubmission = party.submissions[partyStatus.current!.index];
    return (
      <div>
        {partySubmission && (
          <ViewPartySubmission
            key={partySubmission.id}
            partySubmission={partySubmission}
            partyStatus={partyStatus}
            numSubmissions={party.submissions?.length || 0}
            onRating={onRating}
          />
        )}
      </div>
    );
  }

  if (partyStatus.state === 'prereveal') {
    return (
      <div>
        <div className="flex flex-col items-center space-y-4 mt-20">
          <p className="text-5xl">Thanks for voting!</p>
          <p className="text-3xl text-gray-700">Waiting for host...</p>
          <div className="py-8">
            <EmojiBar count={partyStatus.participants} />
          </div>
        </div>
      </div>
    );
  }

  if (partyStatus.state === 'reveal') {
    return (
      <div>
        <ViewPartyReveal party={party} partyStatus={partyStatus} />
      </div>
    );
  }

  return <h2>UNKNOWN PARTY STATE: {partyStatus.state}</h2>;
};

function ViewParty() {
  const history = useHistory();
  const [session] = useSession();
  const { id } = useParams<{ id: string }>();

  const party = useParty(id);
  const partyStatus = usePartyStatus(id);

  const { mutate: mutateJoinParty } = useMutation(joinParty);
  const { mutateAsync: mutateNextSubmission } = useMutation(nextPartySubmissions);
  const { mutateAsync: mutatePreviousSubmission } = useMutation(previousPartySubmissions);
  const { mutateAsync: mutateVote } = useMutation(votePartySubmissions);

  const partyUserId = party.data?.userId;
  const currentPartyStatus = party.data && partyStatus.data?.current;
  const partyStatusState = partyStatus.data?.state;
  const partyDone = party.data?.done;

  useEffect(() => {
    if (!id || !session?.token || partyDone) {
      return;
    }
    console.trace('join party');
    mutateJoinParty({ partyId: id, sessionToken: session.token });
  }, [mutateJoinParty, id, session, partyDone]);

  useEffect(() => {
    console.trace(`Current party state: ${partyStatusState}`);
  }, [partyStatusState]);

  const onSubmissionRating = useCallback(
    async (rating: number) => {
      if (!rating) return;
      console.trace('onRating', rating);
      await mutateVote({ partyId: id, rating, sessionToken: session!.token });
    },
    [session, id, mutateVote]
  );

  const onNextButton = async () => {
    await mutateNextSubmission({ partyId: id, sessionToken: session!.token });
  };

  const onPreviousButton = async () => {
    await mutatePreviousSubmission({ partyId: id, sessionToken: session!.token });
  };

  if (party.isError || partyStatus.isError) return <span>error</span>;
  if (party.isLoading || party.isIdle) return <span>Loading</span>;
  if (partyStatus.isLoading || partyStatus.isIdle) return <span>Loading party status</span>;

  const isHost = session!.userId === partyUserId;
  const showControlButtons =
    isHost && (partyStatusState === 'submissions' || partyStatusState === 'reveal' || partyStatusState === 'prereveal');

  return (
    <div>
      <ViewPartyContent
        partyStatus={partyStatus.data}
        party={party.data}
        isHost={isHost}
        onRating={onSubmissionRating}
        onNextButton={onNextButton}
        onRedirect={() => history.push('/')}
      />
      {showControlButtons && (
        <div>
          {currentPartyStatus && currentPartyStatus.position !== 0 && (
            <div className="fixed left-8 top-1/2">
              <Button onClick={onPreviousButton}>
                <FaArrowLeft />
              </Button>
            </div>
          )}
          <div className="fixed right-8 top-1/2">
            <Button onClick={onNextButton}>
              <FaArrowRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewParty;
