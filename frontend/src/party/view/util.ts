import { PartyStatusResponse, PartySubmissionResponse } from '../../api/api-models';

export const totalRating = (submission: PartySubmissionResponse) =>
  submission.votes.reduce((x1, x2) => x1 + x2.rating, 0);

export const avgRating = (submission: PartySubmissionResponse) => {
  if (submission.votes?.length === 0) {
    return 0;
  }

  return (submission.votes.reduce((x1, x2) => x1 + x2.rating, 0) / submission.votes.length).toFixed(1);
};

export const getCurrentIndex = (partyStatus: PartyStatusResponse) => {
  return partyStatus.sequence.findIndex((i) => partyStatus.current?.index === i) ?? 0;
};

export const sortSubmissions = (submissions: PartySubmissionResponse[], asc = true) => {
  const result = [...submissions].sort((a, b) => {
    return totalRating(b) - totalRating(a);
  });

  if (asc) {
    result.reverse();
  }

  return result;
};
