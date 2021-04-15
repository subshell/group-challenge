import { useEffect, useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

function Star({ active, preview, className = '' }: { active: boolean; preview: boolean; className?: string }) {
  return active ? (
    <FaStar color="#ff9900" size={35} className={className} />
  ) : (
    <FaRegStar color="grey" size={35} className={className} />
  );
}

function StarRating({ stars, onRating }: { stars: number; onRating: (rating: number) => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (rating) {
      onRating(rating);
    }
  }, [rating, onRating]);

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
            <Star
              className="transition ease-in-out duration-100 transform hover:scale-125 select-none cursor-pointer"
              active={rating > i}
              preview={hoverRating > i}
            ></Star>
          </div>
        ))}
    </div>
  );
}

export default StarRating;
