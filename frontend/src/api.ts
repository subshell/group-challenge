import useSWR from 'swr';

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
const PARTY_URL = `${API_URL}/parties`;

export const WS_URL = `${API.SECURE ? 'wss' : 'ws'}://${API.HOST}${API.PATH}/ws`;

// api hooks

export function useParty(id: string) {
  const { data, error } = useSWR<PartyResponse>(`${PARTY_URL}/${id}`);

  return {
    party: data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useParties() {
  const { data, error } = useSWR<string[]>(`${PARTY_URL}`);

  return {
    partyIds: data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function createParty(party: PartyResponse) {
  console.log(party);
}

export function createPartyItem(partyId: string, partyItem: PartyItemResponse) {
  console.log(partyId, partyItem);
}
