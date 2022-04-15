import { FunctionComponent, useEffect, useState } from 'react';
import { useReactions } from '../../api/api';

interface TimedReaction {
  reaction: string;
  dieDate: number;
}

const MAX_REACTIONS = 5;
const TTL = 6000;

const ReactionBubbles: FunctionComponent<{ partyId: string }> = ({ partyId }) => {
  const [reactions, setReactions] = useState<TimedReaction[]>([]);
  useReactions(partyId, (reaction) => {
    setReactions(
      [
        ...reactions,
        {
          reaction,
          dieDate: Date.now() + TTL,
        },
      ]
        .reverse()
        .slice(0, MAX_REACTIONS)
        .reverse()
    );
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      setReactions(reactions.filter((reaction) => reaction.dieDate > now));
    }, 500);

    return () => clearInterval(intervalId);
  }, [reactions]);

  return (
    <div className="space-y-2 flex flex-col">
      {reactions.map((reaction, i) => (
        <div key={i} className="flex justify-end">
          <div className="bg-black opacity-90 rounded p-2 text-2xl text-white">{reaction.reaction}</div>
        </div>
      ))}
    </div>
  );
};

export default ReactionBubbles;
