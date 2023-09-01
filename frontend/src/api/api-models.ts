//response interfaces

export interface ConfigResponse {
  fileSize: number;
}

export interface PaginationResponse<T> {
  pageSize: number;
  page: number;
  data: T[];
}

export type PaginationPartiesResponse = PaginationResponse<PartyResponse>;

export interface PartyResponse {
  id: string;
  name: string;
  description: string;
  category: 'photo';
  startDate: string;
  endDate: string;
  done: boolean;
  userId: string;
  slug: string;
  imageId: string;
  submissions: PartySubmissionResponse[];
}

export interface UserResponse {
  id: string;
  username: string;
  email?: string;
}

export interface Vote {
  id: string;
  userId: string;
  rating: number;
  submissionId: string;
}

export interface PartySubmissionResponse {
  id: string;
  userId: string;
  name?: string;
  description?: string;
  submissionDate: string;
  votes: Vote[];
  imageId: string;
}

export interface PartySubmissionFormData {
  files: FileList;
  name: string;
  description: string;
}

export type PartyStatusState = 'open' | 'waitinglobby' | 'submissions' | 'prereveal' | 'reveal' | 'done';

export interface PartyStatusResponse {
  current?: {
    index: number;
    position: number;
    startTime: string;
  };
  sequence: number[];
  partyStartTime: string;
  submissionTimeMs: number;
  participants: number;
  state: PartyStatusState;
  votes: Vote[];
}

export function isPartyLive(partyStatus?: PartyStatusResponse) {
  return partyStatus?.state !== 'open' && partyStatus?.state !== 'done';
}

// session

export interface UserSession {
  token: string;
  username: string;
  userId: string;
}

// ws models

export interface PartyReaction {
  reaction: string;
}

export interface GCWebSocketEvent {
  key: string[];
  operation: 'add' | 'delete' | 'update' | 'live';
  data: PartyStatusResponse | PartyResponse | PartyReaction;
}
