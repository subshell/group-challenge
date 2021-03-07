import { useQuery } from 'react-query';
import { PartyFormData } from './party/create/CreateParty';
import { useSession } from './user/session';

//response interfaces

export interface PartyResponse {
  id: string;
  name: string;
  description: string;
  category: 'photo';
  startDate: string;
  endDate: string;
  items: PartyItemResponse[];
}

export interface PartyItemResponse {
  id: string;
  name?: string;
  imageURL: string;
}

export interface UserResponse {
  id: string;
  username: string;
  token: string;
}

// session

export interface UserSession {
  token: string;
  username: string;
  id: string;
}

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

export const WS_URL = `${API.SECURE ? 'wss' : 'ws'}://${API.HOST}${API.PATH}/ws`;

// api hooks

function useCreateApiHook<T>(queryKey: string[], url: string = `${API_URL}/${queryKey.join('/')}`) {
  const [session] = useSession();

  return useQuery<T>(queryKey, () =>
    fetch(url, {
      headers: {
        'X-AuthToken': session?.token || '',
      },
    }).then((res) => res.json())
  );
}

export const useParty = (id: string) => useCreateApiHook<PartyResponse>(['parties', id]);
export const useParties = () => useCreateApiHook<PartyResponse[]>(['parties']);

// other stuff

export async function signIn(username: string, password: string): Promise<UserResponse | undefined> {
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

export async function signUp(username: string, password: string, email: string): Promise<UserResponse | undefined> {
  const response = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    body: JSON.stringify({ username, password, email }),
  });

  return response.status === 200 ? response.json() : undefined;
}

export async function createParty({ party, sessionToken }: { party: PartyFormData; sessionToken: string }) {
  return await fetch(`${API_URL}/parties`, {
    method: 'POST',
    body: JSON.stringify(party),
    headers: {
      'X-AuthToken': sessionToken,
    },
  }).then((r) => r.json());
}

export function createPartyItem(partyId: string, partyItem: PartyItemResponse) {
  console.log(partyId, partyItem);
}
