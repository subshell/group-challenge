import useSWR from 'swr';
import { Party, PartyItem } from './party/party-data';

export const API_HOST = 'http://localhost:8080'; // '' for production
const API_PATH = `${API_HOST}/_api/v1`;

export const WS_PATH = API_PATH + '/ws';
export const WS_URL = `ws://${API_HOST}/${WS_PATH}`;

export const PARTY_PATH = API_PATH + '/parties';

export function useParty(id: string) {
  const { data, error } = useSWR<Party>(`${PARTY_PATH}/${id}/`);

  return {
    party: data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useParties() {
  const { data, error } = useSWR<string[]>(`${PARTY_PATH}/`);

  return {
    partyIds: data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function createParty(party: Party) {
  console.log(party);
}

export function createPartyItem(partyId: string, partyItem: PartyItem) {
  console.log(partyId, partyItem);
}
