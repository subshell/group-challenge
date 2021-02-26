import { Party, PartyItem } from './party/party-data';

// for local tests
const events: Party[] = [
  {
    id: '123',
    name: 'test',
    description: 'this is a description',
    category: 'photo',
    startDate: new Date(),
    endDate: new Date(),
    items: [
      {
        id: '#1',
        url: 'https://dummyimage.com/1520x1200',
      },
      {
        id: '#2',
        url: 'https://dummyimage.com/1720x1200',
      },
      {
        id: '#3',
        url: 'https://dummyimage.com/1920x1200',
      },
    ],
  },
];

const API_HOST = 'localhost:8080'; // '' for production
const API_PATH = '/_api/v1';

export const WS_PATH = API_PATH + '/ws';
export const WS_URL = `ws://${API_HOST}${WS_PATH}`;

export const PARTY_PATH = API_PATH + '/party';

export function getParty(id: string): Party {
  return events[0];
}

export function getParties(): Party[] {
  return events;
}

export function createParty(party: Party) {
  console.log(party);
}

export function createPartyItem(partyId: string, partyItem: PartyItem) {
  console.log(partyId, partyItem);
}
