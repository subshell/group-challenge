import ReconnectingWebSocket from 'reconnecting-websocket';
import { createContext, useCallback, useContext, useEffect } from 'react';
import { API_URLS } from './api-config';
import { GCWebSocketEvent } from './api-models';

export type WSListener = (wsEvent: GCWebSocketEvent) => any;

export const WebSocketContext = createContext<{ webSocket: WebSocket | null }>({
  webSocket: null,
});

let ws: WebSocket | undefined;
export function createWebSocket(): WebSocket {
  if (!ws) {
    ws = new ReconnectingWebSocket(API_URLS.WS) as WebSocket;
  }
  return ws;
}

function parseWebSocketMsg(msg: string): GCWebSocketEvent | undefined {
  try {
    const msgObj = JSON.parse(msg);
    if (typeof msgObj !== 'object' || !('key' in msgObj)) {
      throw new Error(`invalid ws message ${msgObj}`);
    }

    return msgObj as GCWebSocketEvent;
  } catch (e) {
    console.error('ignoring ws message', e);
  }

  return undefined;
}

function useContextWebSocket() {
  const { webSocket } = useContext(WebSocketContext);
  return webSocket as WebSocket;
}

export function useWebSocket({
  queryKey,
  onEvent,
  includeChildQueryKeys = false,
}: {
  queryKey: string[];
  onEvent?: (e: GCWebSocketEvent, isChild: boolean) => any;
  includeChildQueryKeys?: boolean;
}) {
  const queryKeyJSON = JSON.stringify(queryKey);
  const webSocket = useContextWebSocket();

  const sendEvent = useCallback(
    (event: GCWebSocketEvent) => {
      webSocket.send(JSON.stringify(event));
    },
    [webSocket]
  );

  useEffect(() => {
    const wsListener = (msg: MessageEvent<string>) => {
      const queryKey: string[] = JSON.parse(queryKeyJSON);
      const gcWebSocketEvent = parseWebSocketMsg(msg.data);

      if (!gcWebSocketEvent) {
        return;
      }

      const eventQueryKeyJSON = JSON.stringify(gcWebSocketEvent.key);
      const startsWithChildQueryKey =
        includeChildQueryKeys && queryKey.every((key, i) => key === gcWebSocketEvent.key[i]);
      if (eventQueryKeyJSON === queryKeyJSON || startsWithChildQueryKey) {
        onEvent?.(gcWebSocketEvent, startsWithChildQueryKey);
      }
    };

    console.debug('register ws listener', queryKeyJSON);
    webSocket.addEventListener('message', wsListener);
    return () => {
      console.debug('remove ws listener', queryKeyJSON);
      webSocket.removeEventListener('message', wsListener);
    };
  }, [webSocket, onEvent, queryKeyJSON, includeChildQueryKeys]);

  return {
    sendEvent,
  };
}
