function ReactionPicker({ reactions = [] }: { reactions: string[] }) {
  return (
    <div className="flex lg:flex-col lg:space-y-4 lg:absolute flex-row bg-white rounded p-1 shadow-lg right-0">
      {reactions.map((reaction) => (
        <button className="cursor-pointer select-none text-xl hover:bg-blue-200 p-1 rounded" key={reaction}>
          {reaction}
        </button>
      ))}
    </div>
  );
}

export default ReactionPicker;
