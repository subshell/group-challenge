import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
  joinParty,
  nextPartySubmissions,
  previousPartySubmissions,
  useParty,
  usePartyStatus,
  votePartySubmissions,
} from '../../api';
import ViewPartySubmission from './ViewPartySubmission';
import ViewPartyDoneItem from './ViewPartyDoneItem';
import { PartySubmissionResponse } from '../../api-models';
import Button from '../../components/Button';
import { useMutation } from 'react-query';
import { useSession } from '../../user/session';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// TODO optimize periodic fetching with WebSockets
function ViewParty() {
  const [session] = useSession();
  const { id } = useParams<{ id: string }>();

  const party = useParty(id);
  const partyStatus = usePartyStatus(id);

  const [partySubmission, setPartySubmission] = useState<PartySubmissionResponse | undefined>(undefined);

  const { mutate: mutateJoinParty } = useMutation(joinParty);
  const { mutateAsync: mutateNextSubmission } = useMutation(nextPartySubmissions);
  const { mutateAsync: mutatePreviousSubmission } = useMutation(previousPartySubmissions);
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
    console.log('join party');
    mutateJoinParty({ partyId: id, sessionToken: session.token });
  }, [mutateJoinParty, id, session]);

  useEffect(() => {
    refetchParty();
  }, [refetchParty, currentPartyStatus]);

  useEffect(() => {
    if (!currentPartyStatus || !submissions) return;
    console.log('fetching submission');
    setPartySubmission(submissions[currentPartyStatus.index]);
    refetchParty();
  }, [submissions, currentPartyStatus, refetchParty, setPartySubmission]);

  const onSubmissionDone = useCallback(async () => {
    console.log('submission done');
    await refetchStatus();
    await refetchParty();
  }, [refetchStatus, refetchParty]);

  const onSubmissionRating = useCallback(
    async (rating: number) => {
      if (!rating) return;
      console.log('onRating', rating);
      await mutateVote({ partyId: id, rating, sessionToken: session!.token });
      await refetchStatus();
    },
    [session, id, refetchStatus, mutateVote]
  );

  const onNextButton = async () => {
    await mutateNextSubmission({ partyId: id, sessionToken: session!.token });
    await refetchStatus();
  };

  const onPreviousButton = async () => {
    await mutatePreviousSubmission({ partyId: id, sessionToken: session!.token });
    await refetchStatus();
  };

  if (party.isError || partyStatus.isError) return <span>error</span>;
  if (party.isLoading || party.isIdle) return <span>Loading</span>;
  if (partyStatus.isLoading || partyStatus.isIdle) return <span>Loading party status</span>;

  if (party.data.done) {
    return <ViewPartyDoneItem party={party.data} />;
  }

  if (!currentPartyStatus) {
    return (
      <div className="flex flex-col items-center justify-center align-middle space-y-8">
        {session?.userId === partyUserId && <Button onClick={onNextButton}>Start</Button>}
        {session?.userId !== partyUserId && <div>Wating for party host to press start...</div>}
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
      {session?.userId === partyUserId && (
        <>
          {currentPartyStatus.index > 0 && (
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
        </>
      )}
    </div>
  );
}

export default ViewParty;
