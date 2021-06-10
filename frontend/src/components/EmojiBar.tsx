const EMOJIS = [
  '🥳',
  '😎',
  '🦄',
  '👻',
  '🙃',
  '😡',
  '📸',
  '🌞',
  '🤦‍♂️',
  '🦋',
  '😃',
  '👩‍🎨',
  '😷',
  '🤡',
  '🤖',
  '👀',
  '🐱',
  '🤹‍♀️',
  '🦦',
];

function EmojiBar({ count }: { count: number }) {
  return (
    <span className="flex flex-row text-4xl space-x-2">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <span key={i}>{EMOJIS[i % EMOJIS.length]}</span>
        ))}
    </span>
  );
}

export default EmojiBar;
