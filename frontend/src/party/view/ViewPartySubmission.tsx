import InnerImageZoom from 'react-inner-image-zoom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getImageUrl } from '../../api';
import { PartyStatusResponse, PartySubmissionResponse } from '../../api-models';
import StarRating from '../../components/StarRating';
import Timer from '../../components/Timer';
import ReactionPicker from '../../components/ReactionPicker';

export interface ViewPartySubmissionProps {
  partySubmission: PartySubmissionResponse;
  partyStatus: PartyStatusResponse;
  onDone?: (rating: number) => any;
  onRating?: (rating: number) => any;
}

const REACTIONS = ['😍', '😐', '🤢', '😎', '😂', '😡'];

function ViewPartySubmission({ partySubmission, onDone, onRating, partyStatus }: ViewPartySubmissionProps) {
  const [rating, setRating] = useState(0);
  const onTimer = useCallback(() => {
    onDone?.(rating);
  }, [rating]);

  useEffect(() => {
    onRating?.(rating);
  }, [rating]);

  return (
    <section className="text-gray-600 body-font space-y-2">
      <div className="container mx-auto flex px-5 flex-col space-y-2 lg:w-4/6 md:w-full w-5/6">
        <Timer
          forSeconds={partyStatus.submissionTimeMs / 1_000}
          startAt={new Date(partyStatus.current!.startTime)}
          onFinish={onTimer}
        />

        {useMemo(
          () => (
            <InnerImageZoom
              className="object-cover object-center rounded"
              src={getImageUrl(partySubmission.imageId)}
              hideHint={true}
              hideCloseButton={true}
              zoomSrc={getImageUrl(partySubmission.imageId)}
            />
          ),
          [partySubmission]
        )}

        <div className="flex flex-row justify-between mt-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-medium text-gray-900">{partySubmission.name}</h3>
            <p className="text-gray-600">{partySubmission.description}</p>
          </div>
          <div className="flex justify-center flex-col items-start">
            <StarRating stars={10} onRating={setRating} />
            <div className="mt-4">
              <span className="text-gray-600 text-xl">{partyStatus.current!.votes.length}</span>
              <span className="text-gray-300 ml-2 mr-2 text-xl">/</span>
              <span className="text-gray-800 text-2xl">{partyStatus.participants}</span>
              <span className="text-gray-600 ml-4 text-xl">votes</span>
            </div>
          </div>
        </div>
        <ReactionPicker reactions={REACTIONS} />
      </div>
    </section>
  );
}

export default ViewPartySubmission;
