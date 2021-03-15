import InnerImageZoom from 'react-inner-image-zoom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getImageUrl } from '../../api';
import { PartySubmissionResponse } from '../../api-models';
import StarRating from '../../components/StarRating';
import Timer from '../../components/Timer';
import ReactionPicker from '../../components/ReactionPicker';
import { relative } from 'node:path';

export interface ViewPartySubmissionProps {
  partySubmission: PartySubmissionResponse;
  onDone?: (rating: number) => any;
  onRating?: (rating: number) => any;
}

const REACTIONS = ['😍', '😐', '🤢', '😎', '😂', '😡'];

function ViewPartySubmission({ partySubmission, onDone, onRating }: ViewPartySubmissionProps) {
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
        <Timer forSeconds={800} onFinish={onTimer} />

        {useMemo(
          () => (
            <InnerImageZoom
              className="object-cover h-screen object-center rounded"
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
            <h3 className="sm:text-4xl text-3xl font-medium text-gray-900">{partySubmission.name}</h3>
            <p className="text-gray-600">{partySubmission.description}</p>
          </div>
          <div className="flex justify-center flex-col items-start">
            <StarRating stars={10} onRating={setRating} />
            <div className="mt-4">
              <span className="text-gray-600 text-2xl">5</span>
              <span className="text-gray-300 ml-2 mr-2 text-2xl">/</span>
              <span className="text-gray-800 text-4xl">10</span>
              <span className="text-gray-600 ml-4 text-2xl">votes</span>
            </div>
          </div>
        </div>
        <ReactionPicker reactions={REACTIONS} />
      </div>
    </section>
  );
}

export default ViewPartySubmission;
