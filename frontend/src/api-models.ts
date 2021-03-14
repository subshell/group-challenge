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

// session

export interface UserSession {
  token: string;
  username: string;
  userId: string;
}
