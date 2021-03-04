import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { PartyItemResponse, useParty, WS_URL } from '../../api';
import ViewPartyItem from './ViewPartyItem';
import useWebSocket from 'react-use-websocket';
import ViewPartyDoneItem from './ViewPartyDoneItem';

function ViewParty() {
  const { id } = useParams<{ id: string }>();
  const [partyItemIndex, setPartyItemIndex] = useState(0);
  const [partyItem, setPartyItem] = useState<PartyItemResponse | undefined>(undefined);
  const { sendMessage } = useWebSocket(WS_URL, {
    onMessage: (msg) => console.log(msg),
    onOpen: () => console.log('opened'),
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (_) => true,
  });
  const onItemDone = useCallback(
    (rating: number) => {
      sendMessage('last rating:' + rating);
      setPartyItemIndex((index) => index + 1);
    },
    [partyItemIndex, sendMessage]
  );
  const onItemRating = useCallback(
    (rating: number) => {
      sendMessage('intermediate rating:' + rating);
    },
    [sendMessage]
  );

  const { data: party, isError, isLoading } = useParty(id);

  useEffect(() => {
    setPartyItem(party?.items[partyItemIndex]);
  }, [party, partyItemIndex]);

  if (isError) return <span> ERROR </span>;
  if (isLoading) return <span> LOADING </span>;

  if (partyItemIndex === party?.items.length) {
    return <ViewPartyDoneItem party={party} />;
  }

  return (
    <div>
      {partyItem && (
        <ViewPartyItem key={partyItem.id} partyItem={partyItem} onDone={onItemDone} onRating={onItemRating} />
      )}
    </div>
  );
}

export default ViewParty;
