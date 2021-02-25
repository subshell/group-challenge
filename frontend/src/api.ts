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

export function createWs() {}

export const SOCKET_URL = 'ws://localhost:8080/ws/123';
