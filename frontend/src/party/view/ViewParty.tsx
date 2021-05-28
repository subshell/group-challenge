import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
  joinParty,
  nextPartySubmissions,
  previousPartySubmissions,
  useParty,
  usePartyStatus,
  votePartySubmissions,
} from '../../api/api';
import ViewPartySubmission from './ViewPartySubmission';
import ViewPartyDoneItem from './ViewPartyDoneItem';
import { PartySubmissionResponse } from '../../api/api-models';
import Button from '../../components/Button';
import { useMutation } from 'react-query';
import { useSession } from '../../user/session';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import ViewPartyStartPage from './ViewPartyStartPage';

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

  useEffect(() => {
    if (!id || !session?.token) {
      return;
    }
    console.log('join party');
    mutateJoinParty({ partyId: id, sessionToken: session.token });
  }, [mutateJoinParty, id, session]);

  useEffect(() => {
    if (!currentPartyStatus || !submissions) return;
    console.log('updating submission');
    setPartySubmission(submissions[currentPartyStatus.index]);
  }, [submissions, currentPartyStatus, setPartySubmission]);

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

  if (party.data.done) {
    return <ViewPartyDoneItem party={party.data} />;
  }

  if (!currentPartyStatus) {
    return (
      <ViewPartyStartPage
        isHost={session?.userId === partyUserId}
        participants={partyStatus.data.participants}
        onPartyStart={onNextButton}
      />
    );
  }

  return (
    <div>
      {partySubmission && (
        <ViewPartySubmission
          key={partySubmission.id}
          partySubmission={partySubmission}
          partyStatus={partyStatus.data}
          numSubmissions={submissions?.length || 0}
          onRating={onSubmissionRating}
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
