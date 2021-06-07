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
import { PartyResponse, PartyStatusResponse, PartyStatusState } from '../../api/api-models';
import Button from '../../components/Button';
import { useMutation } from 'react-query';
import { useSession } from '../../user/session';
import { FaArrowLeft, FaArrowRight, FaMedal } from 'react-icons/fa';
import ViewPartyStartPage from './ViewPartyStartPage';
import ViewPartyReveal from './ViewPartyReveal';
import Stepper from '../../components/Stepper';

const getStepperIndex = (partyStatusState?: PartyStatusState) => {
  if (partyStatusState === 'waitinglobby') {
    return 1;
  }
  if (partyStatusState === 'submissions') {
    return 2;
  }
  if (partyStatusState === 'prereveal' || partyStatusState === 'reveal') {
    return 3;
  }

  return 4;
};

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
          <FaMedal size={128} />
          <span className="text-2xl">Let's see who won!</span>
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

  if (partyStatus.state === 'done') {
    return <ViewPartyLeaderboard party={party} />;
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

  useEffect(() => {
    if (!id || !session?.token) {
      return;
    }
    console.log('join party');
    mutateJoinParty({ partyId: id, sessionToken: session.token });
  }, [mutateJoinParty, id, session]);

  useEffect(() => {
    console.log(`Current party state: ${partyStatusState}`);
  }, [partyStatusState]);

  const onSubmissionRating = useCallback(
    async (rating: number) => {
      if (!rating) return;
      console.log('onRating', rating);
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
      <div className="p-4 -mt-8 mb-8">
        <Stepper currentStepNumber={getStepperIndex(partyStatusState)} steps={['Lobby', 'Voting', 'Awards']} />
      </div>

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
