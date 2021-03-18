import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useParty, usePartyStatus } from '../../api';
import ViewPartySubmission from './ViewPartySubmission';
import ViewPartyDoneItem from './ViewPartyDoneItem';
import { PartySubmissionResponse } from '../../api-models';

function ViewParty() {
  const { id } = useParams<{ id: string }>();
  const party = useParty(id);
  const [partySubmission, setPartySubmission] = useState<PartySubmissionResponse | undefined>(undefined);
  const partyStatus = usePartyStatus(id);
  const onSubmissionDone = useCallback((rating: number) => {
    if (!rating) return;
    console.log(rating);
  }, []);
  const onSubmissionRating = useCallback((rating: number) => {
    if (!rating) return;
    // TODO send rating
    console.log(rating);
  }, []);

  useEffect(() => {
    if (!party.data || !partyStatus.data) return;

    setPartySubmission(party.data.submissions[partyStatus.data.current.index]);
  }, [party.data, partyStatus.data]);

  if (party.isError || partyStatus.isError) return <span>error</span>;
  if (party.isLoading || party.isIdle) return <span>Loading</span>;
  if (partyStatus.isLoading || partyStatus.isIdle) return <span>Loading party status</span>;

  if (partyStatus.data.current.index === party.data.submissions.length) {
    return <ViewPartyDoneItem party={party.data} />;
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
    </div>
  );
}

export default ViewParty;
