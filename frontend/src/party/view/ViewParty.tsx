import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getParty as getParty, SOCKET_URL } from '../../api';
import { PartyItem } from '../party-data';
import ViewPartyItem from './ViewPartyItem';
import useWebSocket from 'react-use-websocket';

function ViewParty() {
  const { id } = useParams<{ id: string }>();
  const [partyItemIndex, setPartyItemIndex] = useState(0);
  const [partyItem, setPartyItem] = useState<PartyItem | undefined>(undefined);
  const { sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, readyState, getWebSocket } = useWebSocket(
    SOCKET_URL,
    {
      onMessage: (msg) => console.log(msg),
      onOpen: () => console.log('opened'),
      //Will attempt to reconnect on all close events, such as server shutting down
      shouldReconnect: (_) => true,
    }
  );
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

  const party = getParty(id);

  useEffect(() => {
    setPartyItem(party.items[partyItemIndex]);
  }, [partyItemIndex]);

  return (
    <div>
      {partyItem && (
        <ViewPartyItem key={partyItem.id} partyItem={partyItem} onDone={onItemDone} onRating={onItemRating} />
      )}
    </div>
  );
}

export default ViewParty;
