import { useCallback, useEffect, useState } from 'react';
import { getImageUrl } from '../../api';
import { PartySubmissionResponse } from '../../api-models';
import StarRating from '../../components/StarRating';
import Timer from '../../components/Timer';

export interface ViewPartySubmissionProps {
  partySubmission: PartySubmissionResponse;
  onDone?: (rating: number) => any;
  onRating?: (rating: number) => any;
}

function ViewPartySubmission({ partySubmission, onDone, onRating }: ViewPartySubmissionProps) {
  const [rating, setRating] = useState(0);
  const onTimer = useCallback(() => {
    onDone?.(rating);
  }, [rating]);

  useEffect(() => {
    onRating?.(rating);
  }, [rating]);

  return (
    <section className="text-gray-600 body-font">
      <Timer forSeconds={10} onFinish={onTimer} />
      <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
        <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">{partySubmission.name}</h1>

        <img
          className="lg:w-2/6 md:w-3/6 w-5/6 mb-10 object-cover object-center rounded"
          alt="hero"
          src={getImageUrl(partySubmission.imageId)}
        />

        <div className="text-center lg:w-2/3 w-full">
          <div className="flex justify-center">
            <StarRating stars={10} onRating={setRating} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ViewPartySubmission;
