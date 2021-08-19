import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../api/api';
import { PartyStatusResponse, PartySubmissionResponse } from '../../api/api-models';
import StarRating from '../../components/StarRating';
import Timer from '../../components/Timer';
import { useSession } from '../../user/session';
import { getSubmissionVotes } from './util';

export interface ViewPartySubmissionProps {
  partySubmission: PartySubmissionResponse;
  partyStatus: PartyStatusResponse;
  numSubmissions: number;
  onDone?: (rating: number) => any;
  onRating?: (rating: number) => any;
}

// const REACTIONS = ['😍', '😐', '🤢', '😎', '😂', '😡'];
// <ReactionPicker reactions={REACTIONS} />

function ViewPartySubmission({
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
    <section className="text-gray-600 body-font space-y-2">
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
        </div>

        <div className="flex flex-row justify-between mt-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-medium text-gray-900">
              <span className="text-gray-800 text-xl">{partyStatus.current!.position + 1}</span>
              <span className="text-gray-400 ml-2 mr-2 text-xl">of</span>
              <span className="text-gray-800 text-xl">{numSubmissions}</span>
            </h3>
            <p>
              <span className="text-gray-800 text-xl mr-4">{partySubmission.name}</span>
              <span className="text-gray-600">{partySubmission.description}</span>
            </p>
          </div>
          <div className="flex justify-center flex-col items-start">
            <StarRating stars={6} onRating={setRating} initialStars={rating} disabled={done} />
            <div className="mt-4">
              <span className="text-gray-600 text-xl">{getSubmissionVotes(partyStatus, partySubmission).length}</span>
              <span className="text-gray-400 ml-2 mr-2 text-xl">/</span>
              <span className="text-gray-800 text-2xl">{partyStatus.participants}</span>
              <span className="text-gray-600 ml-4 text-xl">votes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ViewPartySubmission;
