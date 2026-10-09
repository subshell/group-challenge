import 'photoswipe/dist/photoswipe.css';

import {useEffect, useRef, useState} from 'react';
import { FaStar } from 'react-icons/fa';
import { Gallery, Item } from 'react-photoswipe-gallery';
import { PartySubmissionResponse } from '../../api/api-models';
import { getImageUrl, getThumbnailUrl } from '../../api/api';
import PartyPosition from './rewards/PartyPosition';
import { avgRatingTwoDecimals, totalRating } from './util';
import PhotoSwipe from 'photoswipe';

interface ImageDimensions {
  width: number;
  height: number;
}

function SubmissionGallery({ submissions }: { submissions: PartySubmissionResponse[] }) {
  const [dimensions, setDimensions] = useState<Map<string, ImageDimensions>>(new Map());
  const pswpRef = useRef<PhotoSwipe | null>(null);
  const urlKey = submissions.map((s) => s.imageId).join(',');

  useEffect(() => {
    setDimensions(new Map());

    submissions.forEach((submission, index) => {
      const img = new Image();
      img.src = getImageUrl(submission.imageId);
      const applyDimensions = (width: number, height: number) => {
        setDimensions((prev) => new Map(prev).set(submission.id, { width, height }));

        // If the gallery is open, adjust the image dimensions and refresh the slide (in case it was opened before completely loaded)
        const photoswipe = pswpRef.current;
        if (photoswipe) {
          const dataSource = photoswipe.options.dataSource as Array<Record<string, unknown>>;
          if (Array.isArray(dataSource) && dataSource[index]) {
            dataSource[index].w = width;
            dataSource[index].h = height;
		  	photoswipe.refreshSlideContent(index);
          }
        }
      };
      img.onload = () => applyDimensions(img.naturalWidth, img.naturalHeight);
      img.onerror = () => applyDimensions(800, 600);
    });
  }, [urlKey]);

  return (
      <Gallery
          withCaption
          id="vp-submission-gallery"
          onOpen={(pswp) => { pswpRef.current = pswp; }}
          onClose={() => { pswpRef.current = null; }}
      >
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