import { useEffect, useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

function Star({ active, preview }: { active: boolean; preview: boolean }) {
  const color = preview ? 'grey' : 'black';
  return active ? <FaStar color={color} size={35} /> : <FaRegStar color={color} size={35} />;
}

function StarRating({ stars, onRating }: { stars: number; onRating: (rating: number) => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (rating) {
      onRating(rating);
    }
  }, [rating]);

  return (
    <div className="flex flex-row">
      {Array(stars)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            onMouseOver={() => setHoverRating(i + 1)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(i + 1)}
          >
            <Star active={rating > i} preview={hoverRating > i}></Star>
          </div>
        ))}
    </div>
  );
}

export default StarRating;
