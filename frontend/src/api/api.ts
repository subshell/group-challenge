import { useCallback } from 'react';
import { useQuery, useQueryClient, UseQueryOptions } from 'react-query';
import {
  PartyResponse,
  PartyStatusResponse,
  PartySubmissionFormData,
  UserResponse,
  UserSession,
  GCWebSocketEvent,
} from './api-models';
import { PartyFormData } from '../party/PartyForm';
import { useSession } from '../user/session';
import { API_URLS } from './api-config';
import { useWebSocket } from './api-websockets';

export class RequestError extends Error {
  constructor(public readonly status: number) {
    super(status + '');
  }
}

function useLiveApiHook<T>({
  queryKey,
  includeChildQueryKeys = false,
  url = `${API_URLS.API}/${queryKey.join('/')}`,
  useQueryOptions,
}: {
  queryKey: string[];
  includeChildQueryKeys?: boolean;
  url?: string;
  useQueryOptions?: UseQueryOptions<T, unknown, T>;
}) {
  const apiHook = useApiHook({ queryKey, url, useQueryOptions });
  useUpdateQueryDataFromEvents({ queryKey, includeChildQueryKeys, refetch: apiHook.refetch });

  return apiHook;
}

function useApiHook<T>({
  queryKey,
  url = `${API_URLS.API}/${queryKey.join('/')}`,
  useQueryOptions,
}: {
  queryKey: string[];
  url?: string;
  useQueryOptions?: UseQueryOptions<T, unknown, T>;
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
    useQueryOptions
  );
}

const useUpdateQueryDataFromEvents = ({
  queryKey,
  includeChildQueryKeys,
  refetch,
}: {
  queryKey: string[];
  includeChildQueryKeys: boolean;
  refetch: () => any;
}) => {
  const queryKeyJSON = JSON.stringify(queryKey);
  const queryClient = useQueryClient();
  const onEvent = useCallback(
    (e: GCWebSocketEvent, isChild: boolean) => {
      const queryKey: string[] = JSON.parse(queryKeyJSON);
      console.log('received ws event:', queryKey.join('/'));

      if (isChild) {
        console.log('refetch list for ' + queryKey);
        refetch();
      } else {
        queryClient.setQueryData(queryKey, e.data);
      }
    },
    [queryClient, queryKeyJSON, refetch]
  );
  useWebSocket({ queryKey, onEvent, includeChildQueryKeys });
};

export const getImageUrl = (imageId: string) => `${API_URLS.API}/images/${imageId}`;

export const useParties = () => useLiveApiHook<PartyResponse[]>({ queryKey: ['parties'], includeChildQueryKeys: true });
export const useParty = (id: string) => useLiveApiHook<PartyResponse>({ queryKey: ['parties', id] });
export const usePartyStatus = (id: string) =>
  useLiveApiHook<PartyStatusResponse>({ queryKey: ['parties', id, 'live', 'status'] });
export const useUsers = () => useApiHook<UserResponse[]>({ queryKey: ['users'] });
export const useUser = (id: string) => useApiHook<UserResponse>({ queryKey: ['users', id] });

export async function signIn(username: string, password: string): Promise<UserSession | undefined> {
  const rawHeader = `${username}:${password}`;
  const response = await fetch(`${API_URLS.AUTH}/signin`, {
    headers: {
      Authorization: `Bearer ${window.btoa(rawHeader)}`,
    },
    method: 'POST',
  });

  return response.status === 200 ? response.json() : undefined;
}

export async function signOut(): Promise<boolean> {
  const response = await fetch(`${API_URLS.AUTH}/signout`, { method: 'POST' });
  return response.status === 200;
}

export async function signUp(user: { username: string; password: string; email: string }): Promise<Response> {
  return await fetch(`${API_URLS.AUTH}/register`, {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

export async function createParty({
  party,
  sessionToken,
}: {
  party: PartyFormData;
  sessionToken: string;
}): Promise<PartyResponse> {
  return await fetch(`${API_URLS.API}/parties`, {
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
  return await fetch(`${API_URLS.API}/parties/${partyId}`, {
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
  return await fetch(`${API_URLS.API}/parties/${partyId}/live/start`, {
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
  return await fetch(`${API_URLS.API}/parties/${partyId}/live/join`, {
    method: 'POST',
    headers: {
      'X-AuthToken': sessionToken,
    },
  }).then((r) => r.json());
}

export async function reopenParty({
  partyId,
  sessionToken,
}: {
  partyId: string;
  sessionToken: string;
}): Promise<Response> {
  return await fetch(`${API_URLS.API}/parties/${partyId}/reopen`, {
    method: 'POST',
    headers: {
      'X-AuthToken': sessionToken,
    },
  });
}

export async function deleteParty({
  partyId,
  sessionToken,
}: {
  partyId: string;
  sessionToken: string;
}): Promise<Response> {
  return await fetch(`${API_URLS.API}/parties/${partyId}`, {
    method: 'DELETE',
    headers: {
      'X-AuthToken': sessionToken,
    },
  });
}

export async function deleteSubmission({
  partyId,
  submissionId,
  sessionToken,
}: {
  partyId: string;
  submissionId: string;
  sessionToken: string;
}): Promise<Response> {
  return await fetch(`${API_URLS.API}/parties/${partyId}/submissions/${submissionId}`, {
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
  return await fetch(`${API_URLS.API}/parties/${partyId}/live/next`, {
    method: 'POST',
    headers: {
      'X-AuthToken': sessionToken,
    },
  }).then((r) => r.json());
}

export async function previousPartySubmissions({
  partyId,
  sessionToken,
}: {
  partyId: string;
  sessionToken: string;
}): Promise<PartyStatusResponse> {
  return await fetch(`${API_URLS.API}/parties/${partyId}/live/previous`, {
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
  return await fetch(`${API_URLS.API}/parties/${partyId}/live/vote`, {
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
}): Promise<Response> {
  const formData = new FormData();
  formData.append('image', submission.files[0]);
  const meta: any = {
    ...submission,
  };
  delete meta.files;
  formData.append('meta', JSON.stringify(meta));

  return await fetch(`${API_URLS.API}/parties/${partyId}/submissions`, {
    method: 'POST',
    body: formData,
    headers: {
      'X-AuthToken': sessionToken,
    },
  });
}
