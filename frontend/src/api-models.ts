//response interfaces

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

export interface PartyStatusResponse {
  current?: {
    index: number;
    startTime: string;
    votes: number[];
  };
  partyStartTime: string;
  submissionTimeMs: number;
  participants: number;
  isLive: boolean;
}

// session

export interface UserSession {
  token: string;
  username: string;
  userId: string;
}

// ws models

export type WSEvent = WSRatingEvent;

export interface WSRatingEvent {
  type: 'rating';
  data: {
    rating: number;
  };
}
