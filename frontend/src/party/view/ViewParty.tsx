import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { nextPartySubmissions, useParty, usePartyStatus, votePartySubmissions } from '../../api';
import ViewPartySubmission from './ViewPartySubmission';
import ViewPartyDoneItem from './ViewPartyDoneItem';
import { PartySubmissionResponse } from '../../api-models';
import Button from '../../components/Button';
import { useMutation } from 'react-query';
import { useSession } from '../../user/session';

function ViewParty() {
  const [session] = useSession();
  const { id } = useParams<{ id: string }>();
  const party = useParty(id);
  const [waitForNextSubmission, setWaitForNextSubmission] = useState<boolean>(false);
  const [partySubmission, setPartySubmission] = useState<PartySubmissionResponse | undefined>(undefined);
  const partyStatus = usePartyStatus(id);
  const { mutateAsync: nextMutateAsync } = useMutation(nextPartySubmissions);
  const { mutateAsync: voteMutateAsync } = useMutation(votePartySubmissions);
  const onSubmissionDone = useCallback(() => {
    if (session?.userId !== party.data?.userId || !partyStatus.data?.current) {
      return;
    }
    console.log('done');
    setWaitForNextSubmission(true);
  }, [session?.userId, party.data?.userId, partyStatus.data?.current]);
  const onSubmissionRating = useCallback(
    (rating: number) => {
      if (!rating) return;
      voteMutateAsync({ partyId: id, rating, sessionToken: session!.token });
    },
    [session, id]
  );
  const onNextButton = async () => {
    console.log('next');
    const partyStatusResponse = await nextMutateAsync({ partyId: id, sessionToken: session!.token });
    setWaitForNextSubmission(false);
    if (!partyStatusResponse.current) {
      party.refetch();
    }
  };

  useEffect(() => {
    if (!party.data || !partyStatus.data?.current) return;

    setPartySubmission(party.data.submissions[partyStatus.data.current.index]);
  }, [party.data, partyStatus.data]);

  if (party.isError || partyStatus.isError) return <span>error</span>;
  if (party.isLoading || party.isIdle) return <span>Loading</span>;
  if (partyStatus.isLoading || partyStatus.isIdle) return <span>Loading party status</span>;

  if (party.data.done) {
    return <ViewPartyDoneItem party={party.data} />;
  }

  if (!partyStatus.data.current || waitForNextSubmission) {
    return (
      <div className="flex flex-col items-center justify-center align-middle space-y-8">
        {session?.userId === party.data.userId && <Button onClick={onNextButton}>Next Image</Button>}
        <div>Wating for next round to start...</div>
      </div>
    );
  }

  return (
    <div>
      {session?.userId === party.data.userId && (
        <div className="mb-4 container">
          <Button onClick={onNextButton}>Next Image</Button>
        </div>
      )}
      {partySubmission && (
        <ViewPartySubmission
          key={partySubmission.id}
          partySubmission={partySubmission}
          onDone={onSubmissionDone}
          onRating={onSubmissionRating}
          partyStatus={partyStatus.data}
        />
      )}
    </div>
  );
}

export default ViewParty;
