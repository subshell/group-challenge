//response interfaces

export interface PartyResponse {
  id: string;
  name: string;
  description: string;
  category: 'photo';
  startDate: string;
  endDate: string;
  userId: string;
  slug: string;
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
  user: UserResponse;
  name?: string;
  description?: string;
  submissionDate: string;
  imageURL: string;
  votes: Vote[];
}

// session

export interface UserSession {
  token: string;
  username: string;
  id: string;
}
