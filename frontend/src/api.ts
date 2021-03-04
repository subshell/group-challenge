import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useLocalStorage } from 'react-use';

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

// issue: https://github.com/streamich/react-use/issues/1831
const sessionChangeListener: Array<(value: UserSession | undefined) => void> = [];
export const useSession: () => [UserSession | undefined, (v: UserSession) => void, () => void] = () => {
  const [session, setSession, removeSession] = useLocalStorage<UserSession | undefined>('session');

  const removeSessionCB = useCallback(() => {
    removeSession();
    sessionChangeListener.forEach((fn) => fn(undefined));
  }, []);

  const setSessionCB = useCallback((value) => {
    setSession(value);
    sessionChangeListener.forEach((fn) => fn(value));
  }, []);

  useEffect(() => {
    const fn = (value: UserSession | undefined) => {
      value ? setSession(value) : removeSession();
    };
    sessionChangeListener.push(fn);

    return () => {
      sessionChangeListener.splice(sessionChangeListener.indexOf(fn), 1);
    };
  }, [setSession, removeSession]);

  return [session, setSessionCB, removeSessionCB];
};

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
export const useParties = () => useCreateApiHook<string[]>(['parties']);

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

export async function register(): Promise<UserResponse> {
  const response: UserResponse = await fetch(`${AUTH_URL}/register`, { method: 'POST' }).then((res) => res.json());

  return response;
}

export function createParty(party: PartyResponse) {
  console.log(party);
}

export function createPartyItem(partyId: string, partyItem: PartyItemResponse) {
  console.log(partyId, partyItem);
}
