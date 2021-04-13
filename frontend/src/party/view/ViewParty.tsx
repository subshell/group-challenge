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
  const mutateParty = useMutation(joinParty);
  const [partySubmission, setPartySubmission] = useState<PartySubmissionResponse | undefined>(undefined);
  const partyStatus = usePartyStatus(id);
  const nextMutation = useMutation(nextPartySubmissions);
  const voteMutation = useMutation(votePartySubmissions);
  const [waitForNextSubmission, setWaitForNextSubmission] = useState<boolean>(false);

  const onSubmissionDone = useCallback(async () => {
    if (session?.userId !== party.data?.userId) {
      return;
    }
    console.log('submission done');
    await partyStatus.refetch();
    await party.refetch();
    setWaitForNextSubmission(true);
  }, [session?.userId, party.data?.userId]);
  const onSubmissionRating = useCallback(
    (rating: number) => {
      if (!rating) return;
      voteMutation.mutateAsync({ partyId: id, rating, sessionToken: session!.token }).then(() => partyStatus.refetch());
    },
    [session, id]
  );
  const onNextButton = async () => {
    await nextMutation.mutateAsync({ partyId: id, sessionToken: session!.token });
    await partyStatus.refetch();
    setWaitForNextSubmission(false);
  };

  useEffect(() => {
    if (!party.data?.id) {
      return;
    }
    mutateParty.mutate({ partyId: party.data.id, sessionToken: session!.token });
  }, [party.data?.id]);

  useEffect(() => {
    party.refetch();
  }, [partyStatus.data?.current, partyStatus.data?.isLive, partyStatus.data?.participants]);

  useEffect(() => {
    if (!party.data || !partyStatus.data?.current) return;
    setPartySubmission(party.data.submissions[partyStatus.data.current.index]);
    party.refetch();
  }, [party.data?.submissions, partyStatus.data?.current?.index]);

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
