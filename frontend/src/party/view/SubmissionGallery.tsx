import 'photoswipe/dist/photoswipe.css';

import { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { Gallery, Item } from 'react-photoswipe-gallery';
import { PartySubmissionResponse } from '../../api/api-models';
import { getImageUrl, getThumbnailUrl } from '../../api/api';
import PartyPosition from './rewards/PartyPosition';
import { avgRatingTwoDecimals, totalRating } from './util';

interface ImageDimensions {
  width: number;
  height: number;
}

function useImageDimensions(imageUrls: string[], imageIds: string[]): Map<string, ImageDimensions> {
  const [dimensions, setDimensions] = useState<Map<string, ImageDimensions>>(new Map());

  useEffect(() => {
    const newDimensions = new Map<string, ImageDimensions>();
    let loadedCount = 0;

    imageUrls.forEach((url, idx) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        newDimensions.set(imageIds[idx], { width: img.naturalWidth, height: img.naturalHeight });
        loadedCount++;
        if (loadedCount === imageUrls.length) {
          setDimensions(new Map(newDimensions));
        }
      };
      img.onerror = () => {
        // Fallback dimensions
        newDimensions.set(imageIds[idx], { width: 800, height: 600 });
        loadedCount++;
        if (loadedCount === imageUrls.length) {
          setDimensions(new Map(newDimensions));
        }
      };
    });
  }, imageUrls);

  return dimensions;
}

function SubmissionGallery({ submissions }: { submissions: PartySubmissionResponse[] }) {
  const originalUrls = submissions.map((s) => getImageUrl(s.imageId));
  const imageIds = submissions.map((s) => s.id);
  const dimensions = useImageDimensions(originalUrls, imageIds);

  return (
    <Gallery withCaption id="vp-submission-gallery">
      {submissions.map((submission, i) => {
        const currentDimensions = dimensions.get(submission.id);
        return (
          <div id={"vp-gallery-submission-" + i} className="flex items-center justify-items-center space-x-4 space-y-4" key={submission.id}>
            <PartyPosition position={i} />
            <Item
              original={getImageUrl(submission.imageId)}
              thumbnail={getThumbnailUrl(submission.imageId)}
              width={currentDimensions?.width}
              height={currentDimensions?.height}
              caption={submission.name}>
              {({ ref, open }) => (
                <img
                  style={{ cursor: 'pointer', maxHeight: '240px' }}
                  className="w-96 rounded object-contain"
                  ref={ref}
                  onClick={open}
                  src={getThumbnailUrl(submission.imageId)} />
              )}
            </Item>
            <div className="flex flex-col justify-between h-full">
              <div>
                <b>{submission.name}</b> {submission.description}
              </div>
              <div className="text-2xl">Ø {avgRatingTwoDecimals(submission.votes)}</div>
              <div className="flex items-center space-x-1">
                <div>{totalRating(submission.votes)}</div>
                <FaStar size={20} />
              </div>
              <div>{submission.votes.length} vote(s)</div>
            </div>
          </div>
        );
      })}
    </Gallery>
  );
}

export default SubmissionGallery;