import { useQuery } from 'react-query';

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
const PARTY_URL = `${API_URL}/parties`;

export const WS_URL = `${API.SECURE ? 'wss' : 'ws'}://${API.HOST}${API.PATH}/ws`;

// api hooks

export function useParty(id: string) {
  return useQuery<PartyResponse>(['party', id], () => fetch(`${PARTY_URL}/${id}`).then((res) => res.json()));
}

export function useParties() {
  return useQuery<string[]>('parties', () => fetch(PARTY_URL).then((res) => res.json()));
}

// other stuff

export async function signIn(username: string, password: string): Promise<UserResponse | undefined> {
  const rawHeader = `${username}:${password}`;
  const response = await fetch(`${AUTH_URL}/signin`, {
    headers: {
      Authorization: `Bearer ${window.btoa(rawHeader)}`,
    },
    credentials: 'include',
    method: 'POST',
  }).then((res) => res.json());

  return response.status === 200 && response;
}

export async function signOut(): Promise<boolean> {
  const response = await fetch(`${AUTH_URL}/signout`, { method: 'POST', credentials: 'include' });

  return response.status === 200;
}

export async function register(): Promise<UserResponse> {
  const response = await fetch(`${AUTH_URL}/register`, { method: 'POST', credentials: 'include' }).then((res) =>
    res.json()
  );

  return response;
}

export function createParty(party: PartyResponse) {
  console.log(party);
}

export function createPartyItem(partyId: string, partyItem: PartyItemResponse) {
  console.log(partyId, partyItem);
}
