import { useCallback, useEffect, useState } from 'react';
import StarRating from '../../components/StarRating';
import Timer from '../../components/Timer';
import { PartyItem } from '../party-data';

export interface ViewPartyItemProps {
  partyItem: PartyItem;
  onDone?: (rating: number) => any;
  onRating?: (rating: number) => any;
}

function ViewPartyItem({ partyItem, onDone, onRating }: ViewPartyItemProps) {
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
        <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">{partyItem.name}</h1>

        <img
          className="lg:w-2/6 md:w-3/6 w-5/6 mb-10 object-cover object-center rounded"
          alt="hero"
          src={partyItem.imageURL}
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

export default ViewPartyItem;
