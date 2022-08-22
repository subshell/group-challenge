import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../api/api';
import { PartyStatusResponse, PartySubmissionResponse } from '../../api/api-models';
import StarRating from '../../components/StarRating';
import Timer from '../../components/Timer';
import { useSession } from '../../user/session';
import ReactionBubbles from './ReactionBubbles';
import { getSubmissionVotes } from './util';

export interface ViewPartySubmissionProps {
  partySubmission: PartySubmissionResponse;
  partyId: string;
  partyStatus: PartyStatusResponse;
  numSubmissions: number;
  onDone?: (rating: number) => any;
  onRating?: (rating: number) => any;
}

function ViewPartySubmission({
  partyId,
  partySubmission,
  partyStatus,
  numSubmissions,
  onDone,
  onRating,
}: ViewPartySubmissionProps) {
  const [session] = useSession();
  const [rating, setRating] = useState(
    () => getSubmissionVotes(partyStatus, partySubmission, session!.userId)[0]?.rating || 0
  );
  const [done, setDone] = useState(false);
  const onTimer = useCallback(() => {
    toast('⏰ Time is up!', {});
    onDone?.(rating);
    setDone(true);
  }, [rating, onDone]);

  useEffect(() => {
    onRating?.(rating);
  }, [rating, onRating]);

  return (
    <section className="body-font space-y-2">
      <div className="container mx-auto flex px-5 flex-col space-y-2 lg:w-4/6 md:w-full w-5/6">
        <Timer
          forSeconds={partyStatus.submissionTimeMs / 1_000}
          startAt={new Date(partyStatus.current!.startTime)}
          onFinish={onTimer}
        />
        <div className="bg-gray-100 relative">
          <a href={getImageUrl(partySubmission.imageId)} target="_blank" rel="noopener noreferrer">
            <img
              className="object-contain w-full rounded"
              style={{
                maxHeight: '75vh',
              }}
              src={getImageUrl(partySubmission.imageId)}
              alt={partySubmission.name}
            />
          </a>
          <div className="absolute right-2 bottom-2 overflow-y-hidden">
            <ReactionBubbles partyId={partyId} />
          </div>
        </div>
        <div className="flex flex-row justify-between mt-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-medium">
              <span className="text-xl">{partyStatus.current!.position + 1}</span>
              <span className="text-slate-500 ml-2 mr-2 text-xl">of</span>
              <span className="text-xl">{numSubmissions}</span>
            </h3>
            <p>
              <span className="text-xl mr-4">{partySubmission.name}</span>
              <span className="text-slate-500">{partySubmission.description}</span>
            </p>
          </div>
          <div className="flex justify-center flex-col items-start">
            <StarRating stars={6} onRating={setRating} initialStars={rating} disabled={done} />
            <div className="mt-4">
              <span className="text-slate-500 text-xl">{getSubmissionVotes(partyStatus, partySubmission).length}</span>
              <span className="text-slate-500 ml-2 mr-2 text-xl">/</span>
              <span className="text-2xl">{partyStatus.participants}</span>
              <span className="text-slate-500 ml-4 text-xl">votes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ViewPartySubmission;
