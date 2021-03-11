//response interfaces

import { StringMappingType } from 'typescript';

export interface PartyResponse {
  id: string;
  name: string;
  description: string;
  category: 'photo';
  startDate: string;
  endDate: string;
  admin: UserResponse;
  slug: string;
  statistics: PartyStatisticsResponse[];
  submissions: PartySubmissionResponse[];
}

export interface UserResponse {
  id: string;
  username: string;
  email?: string;
}

export interface PartyStatisticsResponse {
  submissionId: StringMappingType;
  participants: UserResponse[];
  rating: number;
}

export interface PartySubmissionResponse {
  id: string;
  user: UserResponse;
  name?: string;
  description?: string;
  submissionDate: string;
  imageURL: string;
}

// session

export interface UserSession {
  token: string;
  username: string;
  id: string;
}
