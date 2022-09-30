import { useEffect } from 'react';
import { getImageUrl } from '../../api/api';
import { PartyResponse, PartyStatusResponse, PartySubmissionResponse, Vote } from '../../api/api-models';

export const totalRating = (votes: Vote[]) => votes.reduce((x1, x2) => x1 + x2.rating, 0);

export const avgRating = (votes: Vote[]) => {
  if (votes?.length === 0) {
    return 0;
  }

  return votes.reduce((x1, x2) => x1 + x2.rating, 0) / votes.length;
};

export const avgRatingTwoDecimals = (votes: Vote[]) => {
  return avgRating(votes).toFixed(2);
};

export const sortSubmissions = (submissions: PartySubmissionResponse[]) => {
  const result = [...submissions].sort((a, b) => {
    return avgRating(b.votes) - avgRating(a.votes);
  });

  return result;
};

export const getSubmissionVotes = (
  partyStatus: PartyStatusResponse,
  submission: PartySubmissionResponse,
  userId?: string
) => {
  return partyStatus.votes.filter((vote) => vote.submissionId === submission.id && (!userId || vote.userId === userId));
};

const preloadImage = (imageURL: string) => {
  new Image().src = imageURL;
};

export const usePreloadNextImage = (party: PartyResponse, partyStatus: PartyStatusResponse) => {
  const currentIndex = partyStatus.current ? partyStatus.sequence[partyStatus.current.index] : -1;
  const nextIndex = Math.min(currentIndex + 1, party.submissions.length - 1);
  const nextIndexInSequence = partyStatus.sequence?.[nextIndex];
  const nextSubmissionImageId = party.submissions?.[nextIndexInSequence]?.imageId;

  useEffect(() => {
    if (!nextSubmissionImageId) {
      return;
    }
    const nextImageURL = getImageUrl(nextSubmissionImageId);
    preloadImage(nextImageURL);
  }, [nextSubmissionImageId]);
};
