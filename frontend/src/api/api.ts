import { useCallback } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  PartyResponse,
  PartyStatusResponse,
  PartySubmissionFormData,
  UserResponse,
  UserSession,
  GCWebSocketEvent,
  PartyReaction,
  PaginationPartiesResponse,
} from './api-models';
import { PartyFormData } from '../party/PartyForm';
import { useSession } from '../user/session';
import { API_URLS } from './api-config';
import { EventQueryKeyMatcher, useWebSocket } from './api-websockets';
import { toast } from 'react-toastify';

export class RequestError extends Error {
  constructor(public readonly status: number) {
    super(status + '');
  }
}

function useLiveApiHook<T>({
  queryKey,
  matchesQueryKeyFn = () => false,
  url = `${API_URLS.API}/${queryKey.join('/')}`,
  useQueryOptions,
}: {
  queryKey: string[];
  matchesQueryKeyFn?: EventQueryKeyMatcher;
  url?: string;
  useQueryOptions?: UseQueryOptions<T, unknown, T>;
}) {
  const apiHook = useApiHook({ queryKey, url, useQueryOptions });
  useUpdateQueryDataFromEvents({ queryKey, matchesQueryKeyFn, refetch: apiHook.refetch });

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
  const [session, setSession] = useSession();

  const fetchData = async (): Promise<T> => {
    const res = await fetch(url, {
      headers: {
        'X-AuthToken': session?.token || '',
      },
    });

    if (res.status >= 400 && res.status < 600) {
      // user is no longer signed in with valid credentials
      if (session && res.status === 401) {
        toast('You session expired');
        setSession(undefined);
      }

      throw new RequestError(res.status);
    }

    return res.json();
  };

  return useQuery<T>(queryKey, fetchData, useQueryOptions);
}

const useUpdateQueryDataFromEvents = ({
  queryKey,
  matchesQueryKeyFn,
  refetch,
}: {
  queryKey: string[];
  matchesQueryKeyFn: EventQueryKeyMatcher;
  refetch: () => any;
}) => {
  const queryKeyJSON = JSON.stringify(queryKey);
  const queryClient = useQueryClient();
  const onEvent = useCallback(
    (e: GCWebSocketEvent, isChild: boolean) => {
      const queryKey: string[] = JSON.parse(queryKeyJSON);

      if (isChild) {
        refetch();
      } else {
        queryClient.setQueryData(queryKey, e.data);
      }
    },
    [queryClient, queryKeyJSON, refetch]
  );
  useWebSocket({ queryKey, onEvent, matchesQueryKeyFn });
};

export const getImageUrl = (imageId: string) => `${API_URLS.API}/images/full/${imageId}`;
export const getThumbnailUrl = (imageId: string) => `${API_URLS.API}/images/thumbnail/${imageId}`;

export const useReactions = (partyId: string, onIncomingReaction: (reaction: string) => void) => {
  const queryKey = ['parties', partyId, 'live', 'reaction'];
  const queryKeyJSON = JSON.stringify(queryKey);
  const matchesQueryKeyFn = useCallback(() => false, []);
  const onEvent = useCallback(
    (e: GCWebSocketEvent) => {
      if (JSON.stringify(e.key) === queryKeyJSON) {
        const reaction = (e.data as PartyReaction).reaction;
        onIncomingReaction(reaction);
      }
    },
    [queryKeyJSON, onIncomingReaction]
  );
  useWebSocket({ queryKey, onEvent, matchesQueryKeyFn });
};

export const useParties = () => {
  const [session] = useSession();

  const queryKey = ['parties'];
  const url = `${API_URLS.API}/${queryKey.join('/')}`;

  const fetchParties = async ({ pageParam = 0 }): Promise<PaginationPartiesResponse> => {
    const res = await fetch(url + `?page=${pageParam}`, {
      headers: {
        'X-AuthToken': session?.token || '',
      },
    });

    return res.json();
  };

  return useInfiniteQuery(queryKey, fetchParties, {
    getNextPageParam: (lastPage) => {
      if (lastPage.data.length !== lastPage.pageSize) {
        return undefined;
      }
      return lastPage.page + 1;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage.page === 0) {
        return undefined;
      }

      return Math.max(0, firstPage.page - 1);
    },
  });
};

export const useParty = (id: string) => useLiveApiHook<PartyResponse>({ queryKey: ['parties', id] });
export const usePartyStatus = (id: string) =>
  useLiveApiHook<PartyStatusResponse>({ queryKey: ['parties', id, 'live', 'status'] });
export const useUsers = () => useApiHook<UserResponse[]>({ queryKey: ['users'] });
export const useUser = (id: string) => useApiHook<UserResponse>({ queryKey: ['users', id] });

export async function signIn(emailOrUsername: string, password: string): Promise<UserSession | undefined> {
  const response = await fetch(`${API_URLS.AUTH}/signin`, {
    body: JSON.stringify({ emailOrUsername, password: window.btoa(password) }),
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

export async function assignModerator({
  partyId,
  userId,
  sessionToken,
}: {
  userId: string;
  partyId: string;
  sessionToken: string;
}): Promise<Response> {
  return await fetch(`${API_URLS.API}/parties/${partyId}/assignModerator`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
    headers: {
      'X-AuthToken': sessionToken,
    },
  });
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

export async function sendReaction({
  partyId,
  sessionToken,
  reaction,
}: {
  partyId: string;
  sessionToken: string;
  reaction: string;
}): Promise<Response> {
  return await fetch(`${API_URLS.API}/parties/${partyId}/live/reaction`, {
    method: 'POST',
    body: JSON.stringify({ reaction }),
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
  const meta: Partial<PartySubmissionFormData> = {
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
