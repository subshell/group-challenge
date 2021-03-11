import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useParty, WS_URL } from '../../api';
import ViewPartySubmission from './ViewPartySubmission';
import useWebSocket from 'react-use-websocket';
import ViewPartyDoneItem from './ViewPartyDoneItem';
import { PartySubmissionResponse } from '../../api-models';

function ViewParty() {
  const { id } = useParams<{ id: string }>();
  const [partySubmissionIndex, setPartySubmissionIndex] = useState(0);
  const [partySubmission, setPartySubmission] = useState<PartySubmissionResponse | undefined>(undefined);
  const { sendMessage } = useWebSocket(WS_URL, {
    onMessage: (msg) => console.log(msg),
    onOpen: () => console.log('opened'),
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (_) => true,
  });
  const onSubmissionDone = useCallback(
    (rating: number) => {
      sendMessage('last rating:' + rating);
      setPartySubmissionIndex((index) => index + 1);
    },
    [partySubmissionIndex, sendMessage]
  );
  const onSubmissionRating = useCallback(
    (rating: number) => {
      sendMessage('intermediate rating:' + rating);
    },
    [sendMessage]
  );

  const { data: party, isError, isLoading } = useParty(id);

  useEffect(() => {
    setPartySubmission(party?.submissions[partySubmissionIndex]);
  }, [party, partySubmissionIndex]);

  if (isError) return <span> ERROR </span>;
  if (isLoading) return <span> LOADING </span>;

  if (partySubmissionIndex === party?.submissions.length) {
    return <ViewPartyDoneItem party={party} />;
  }

  return (
    <div>
      {partySubmission && (
        <ViewPartySubmission
          key={partySubmission.id}
          partySubmission={partySubmission}
          onDone={onSubmissionDone}
          onRating={onSubmissionRating}
        />
      )}
    </div>
  );
}

export default ViewParty;
