import { useCallback, useEffect, useState } from 'react';
import { useQuery, UseQueryOptions } from 'react-query';
import useWebSocket from 'react-use-websocket';
import { PartyResponse, PartyStatusResponse, PartySubmissionFormData, UserSession, WSEvent } from './api-models';
import { PartyFormData } from './party/PartyForm';
import { useSession } from './user/session';

// constants

const API_CUSTOM = {
  SECURE: false,
  HOST: 'localhost:8080',
  PATH: '/_api/v1',
};

const API_AUTO = {
  SECURE: window.location.protocol.startsWith('https'),
  HOST: window.location.host,
  PATH: '/_api/v1',
};

// determine api config dynamically
const API = window.location.host === 'localhost:3000' ? API_CUSTOM : API_AUTO;
const API_URL = `${API.SECURE ? 'https' : 'http'}://${API.HOST}${API.PATH}`;
const AUTH_URL = `${API_URL}/auth`;
const WS_URL = `${API.SECURE ? 'wss' : 'ws'}://${API.HOST}${API.PATH}/ws`;

export const getImageUrl = (imageId: string) => `${API_URL}/images/${imageId}`;

// api hooks

export function useWSEvents() {
  const ws = useWebSocket(WS_URL, {
    onMessage: (msg) => console.log(msg),
    onOpen: () => console.log('ws session created'),
    onClose: () => console.log('ws session closed'),
    onError: (err) => console.error(err),
    shouldReconnect: (_) => true,
  });
  const [lastEvent, setLastEvent] = useState<WSEvent>();
  const sendEvent = useCallback(
    (event: WSEvent) => {
      ws.sendJsonMessage(event);
    },
    [ws]
  );
  useEffect(() => {
    if (!ws.getWebSocket()) {
      return;
    }

    const webSocket: WebSocket = ws.getWebSocket() as WebSocket;
    const onMessage = (msg: MessageEvent) => {
      setLastEvent(JSON.parse(msg.data));
    };
    webSocket.addEventListener('message', onMessage);

    return () => webSocket.removeEventListener('message', onMessage);
  }, [ws]);

  return {
    sendEvent,
    lastEvent,
  };
}

export class RequestError extends Error {
  constructor(public readonly status: number) {
    super(status + '');
  }
}

function useCreateApiHook<T>({
  queryKey,
  url = `${API_URL}/${queryKey.join('/')}`,
  options,
}: {
  queryKey: string[];
  url?: string;
  options?: UseQueryOptions<T, unknown, T>;
}) {
  const [session] = useSession();

  return useQuery<T>(
    queryKey,
    async () => {
      const res = await fetch(url, {
        headers: {
          'X-AuthToken': session?.token || '',
        },
      });

      if (res.status >= 400 && res.status < 600) {
        throw new RequestError(res.status);
      }

      return res.json();
    },
    options
  );
}

export const useParties = () => useCreateApiHook<PartyResponse[]>({ queryKey: ['parties'] });
export const useParty = (id: string) => useCreateApiHook<PartyResponse>({ queryKey: ['parties', id] });
export const usePartyStatus = (id: string) => {
  // invalidate based on websockets
  const useQueryHook = useCreateApiHook<PartyStatusResponse>({
    queryKey: ['parties', id, 'live', 'status'],
    options: { refetchInterval: 3000 },
  });
  return useQueryHook;
};

// other stuff

export async function signIn(username: string, password: string): Promise<UserSession | undefined> {
  const rawHeader = `${username}:${password}`;
  const response = await fetch(`${AUTH_URL}/signin`, {
    headers: {
      Authorization: `Bearer ${window.btoa(rawHeader)}`,
    },
    method: 'POST',
  });

  return response.status === 200 ? response.json() : undefined;
}

export async function signOut(): Promise<boolean> {
  const response = await fetch(`${AUTH_URL}/signout`, { method: 'POST' });
  return response.status === 200;
}

export async function signUp(username: string, password: string, email: string): Promise<UserSession | undefined> {
  const response = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    body: JSON.stringify({ username, password, email }),
  });

  return response.status === 200 ? response.json() : undefined;
}

export async function createParty({
  party,
  sessionToken,
}: {
  party: PartyFormData;
  sessionToken: string;
}): Promise<PartyResponse> {
  return await fetch(`${API_URL}/parties`, {
    method: 'POST',
    body: JSON.stringify(party),
    headers: {
      'X-AuthToken': sessionToken,
    },
  }).then((r) => r.json());
}

export async function editParty({
  party,
  partyId,
  sessionToken,
}: {
  party: PartyFormData;
  partyId: string;
  sessionToken: string;
}): Promise<PartyResponse> {
  return await fetch(`${API_URL}/parties/${partyId}`, {
    method: 'POST',
    body: JSON.stringify(party),
    headers: {
      'X-AuthToken': sessionToken,
    },
  }).then((r) => r.json());
}

export async function startParty({
  partyId,
  sessionToken,
}: {
  partyId: string;
  sessionToken: string;
}): Promise<PartyStatusResponse> {
  return await fetch(`${API_URL}/parties/${partyId}/live/start`, {
    method: 'POST',
    headers: {
      'X-AuthToken': sessionToken,
    },
  }).then((r) => r.json());
}

export async function joinParty({
  partyId,
  sessionToken,
}: {
  partyId: string;
  sessionToken: string;
}): Promise<PartyStatusResponse> {
  return await fetch(`${API_URL}/parties/${partyId}/live/join`, {
    method: 'POST',
    headers: {
      'X-AuthToken': sessionToken,
    },
  }).then((r) => r.json());
}

export async function deleteParty({
  partyId,
  sessionToken,
}: {
  partyId: string;
  sessionToken: string;
}): Promise<Response> {
  return await fetch(`${API_URL}/parties/${partyId}`, {
    method: 'DELETE',
    headers: {
      'X-AuthToken': sessionToken,
    },
  });
}

export async function nextPartySubmissions({
  partyId,
  sessionToken,
}: {
  partyId: string;
  sessionToken: string;
}): Promise<PartyStatusResponse> {
  return await fetch(`${API_URL}/parties/${partyId}/live/next`, {
    method: 'POST',
    headers: {
      'X-AuthToken': sessionToken,
    },
  }).then((r) => r.json());
}

export async function votePartySubmissions({
  partyId,
  rating,
  sessionToken,
}: {
  partyId: string;
  rating: number;
  sessionToken: string;
}): Promise<PartyStatusResponse> {
  return await fetch(`${API_URL}/parties/${partyId}/live/vote`, {
    method: 'POST',
    body: JSON.stringify({ rating }),
    headers: {
      'X-AuthToken': sessionToken,
    },
  }).then((r) => r.json());
}

export async function addSubmission({
  partyId,
  submission,
  sessionToken,
}: {
  partyId: string;
  submission: PartySubmissionFormData;
  sessionToken: string;
}): Promise<PartyResponse> {
  const formData = new FormData();
  formData.append('image', submission.files[0]);
  const meta: any = {
    ...submission,
  };
  delete meta.files;
  formData.append('meta', JSON.stringify(meta));

  return await fetch(`${API_URL}/parties/${partyId}/submissions`, {
    method: 'POST',
    body: formData,
    headers: {
      'X-AuthToken': sessionToken,
    },
  }).then((r) => r.json());
}
