import { FC, useEffect, useRef, useState } from 'react';
import { getThumbnailUrl, useParties } from '../api/api';
import { sortSubmissions } from '../party/view/util';

const Collage: FC = () => {
  const { data: parties, status, isLoading, fetchNextPage, hasNextPage } = useParties();
  const element = useRef<HTMLDivElement>(null);
  const [imageHeight, setImageHeight] = useState(72);
  const [gap, setGap] = useState(0);
  const [padding, setPadding] = useState(0);

  const [nImages, setNImages] = useState(25);

  const submissions = sortSubmissions(
    (parties?.pages || []).flatMap((page) => page.data.flatMap((party) => party.submissions)).slice(0, nImages)
  );

  useEffect(() => {
    if (hasNextPage && nImages > (submissions.length || 100000)) {
      fetchNextPage();
    }
  }, [nImages, parties?.pages.length, hasNextPage, submissions]);

  if (isLoading || !parties) {
    return <></>;
  }

  const nPages = !element.current
    ? 1
    : Math.ceil(
        element.current.scrollHeight /
          element.current.scrollWidth /
          (element.current.offsetHeight / element.current.offsetWidth)
      );

  return (
    <>
      <div className="print:hidden flex flex-col space-y-4">
        <span>Estimated number of pages: {nPages}</span>

        <div>
          <label>Number of Images</label>
          <input
            className="text-black"
            type="number"
            value={nImages}
            min={1}
            max={1000}
            onChange={(e) => setNImages(+e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="imageHeight">Image height</label>
          <input
            className="text-black"
            type="number"
            value={imageHeight}
            min={2}
            max={100}
            onChange={(e) => setImageHeight(+e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="gap">Gap</label>
          <input
            id="gap"
            className="text-black"
            type="number"
            value={gap}
            min={0}
            max={12}
            onChange={(e) => setGap(+e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="gap">Page Margin</label>
          <input
            id="margin"
            className="text-black"
            type="number"
            value={padding}
            min={0}
            max={100}
            onChange={(e) => setPadding(+e.target.value)}
          />
        </div>
      </div>
      <div
        ref={element}
        className="flex flex-row flex-wrap justify-evenly content-start bg-white w-a4 h-a4 m-auto overflow-hidden"
        style={{
          gap: `${gap}px`,
          padding: `${padding}px`,
        }}
      >
        {submissions.map((submission) => (
          <img
            style={{
              height: `${imageHeight}px`,
            }}
            className="inline-block"
            key={submission.id}
            src={getThumbnailUrl(submission.imageId)}
            alt={submission.name}
          />
        ))}
      </div>
    </>
  );
};

export default Collage;
