import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { joinParty, nextPartySubmissions, useParty, usePartyStatus, votePartySubmissions } from '../../api';
import ViewPartySubmission from './ViewPartySubmission';
import ViewPartyDoneItem from './ViewPartyDoneItem';
import { PartySubmissionResponse } from '../../api-models';
import Button from '../../components/Button';
import { useMutation } from 'react-query';
import { useSession } from '../../user/session';
import { FaArrowRight } from 'react-icons/fa';

// TODO optimize periodic fetching with WebSockets
function ViewParty() {
  const [session] = useSession();
  const { id } = useParams<{ id: string }>();

  const party = useParty(id);
  const partyStatus = usePartyStatus(id);

  const [partySubmission, setPartySubmission] = useState<PartySubmissionResponse | undefined>(undefined);
  const [waitForNextSubmission, setWaitForNextSubmission] = useState<boolean>(false);

  const { mutate: mutateJoinParty } = useMutation(joinParty);
  const { mutateAsync: mutateNextParty } = useMutation(nextPartySubmissions);
  const { mutateAsync: mutateVote } = useMutation(votePartySubmissions);

  const partyUserId = party.data?.userId;
  const currentPartyStatus = party.data && partyStatus.data?.current;
  const submissions = party.data?.submissions;
  const refetchParty = party.refetch;
  const refetchStatus = partyStatus.refetch;

  useEffect(() => {
    if (!id || !session?.token) {
      return;
    }
    console.log(mutateJoinParty, id);
    mutateJoinParty({ partyId: id, sessionToken: session?.token });
  }, [mutateJoinParty, id, session]);

  useEffect(() => {
    refetchParty();
  }, [refetchParty, currentPartyStatus]);

  useEffect(() => {
    if (!currentPartyStatus || !submissions) return;
    setPartySubmission(submissions[currentPartyStatus.index]);
    refetchParty();
  }, [submissions, currentPartyStatus, refetchParty, setPartySubmission]);

  const onSubmissionDone = useCallback(async () => {
    if (session?.userId !== partyUserId) {
      return;
    }
    console.log('submission done');
    await refetchStatus();
    await refetchParty();
    setWaitForNextSubmission(true);
  }, [session, partyUserId, refetchStatus, refetchParty]);

  const onSubmissionRating = useCallback(
    (rating: number) => {
      if (!rating) return;
      mutateVote({ partyId: id, rating, sessionToken: session!.token }).then(() => refetchStatus());
    },
    [session, id, refetchStatus, mutateVote]
  );

  const onNextButton = async () => {
    await mutateNextParty({ partyId: id, sessionToken: session!.token });
    await refetchStatus();
    setWaitForNextSubmission(false);
  };

  if (party.isError || partyStatus.isError) return <span>error</span>;
  if (party.isLoading || party.isIdle) return <span>Loading</span>;
  if (partyStatus.isLoading || partyStatus.isIdle) return <span>Loading party status</span>;

  if (party.data.done) {
    return <ViewPartyDoneItem party={party.data} />;
  }

  if (!partyStatus.data.current || waitForNextSubmission) {
    return (
      <div className="flex flex-col items-center justify-center align-middle space-y-8">
        {session?.userId === party.data.userId && (
          <Button onClick={onNextButton}>{!partyStatus.data.current ? 'Start' : 'Next Image'}</Button>
        )}
        {session?.userId !== party.data.userId && <div>Wating for next round to start...</div>}
      </div>
    );
  }

  return (
    <div>
      {partySubmission && (
        <ViewPartySubmission
          key={partySubmission.id}
          partySubmission={partySubmission}
          onDone={onSubmissionDone}
          onRating={onSubmissionRating}
          partyStatus={partyStatus.data}
        />
      )}
      {session?.userId === party.data.userId && (
        <div className="fixed right-8 top-1/2">
          <Button onClick={onNextButton}>
            <FaArrowRight />
          </Button>
        </div>
      )}
    </div>
  );
}

export default ViewParty;
