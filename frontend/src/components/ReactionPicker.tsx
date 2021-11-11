import { FunctionComponent, useCallback, KeyboardEvent, useState } from 'react';
import { FaRegWindowMaximize, FaRegWindowMinimize } from 'react-icons/fa';
import { useAppState } from '../user/appState';

const ReactionPicker: FunctionComponent<{ reactions: string[]; onReaction: (reaction: string) => void }> = ({
  reactions,
  onReaction,
}) => {
  const [appState, setAppState] = useAppState();
  const [textInput, setTextInput] = useState('');
  const onTextSubmit = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (textInput) {
          onReaction(textInput);
          setTextInput('');
        }
      }
    },
    [onReaction, setTextInput, textInput]
  );

  return (
    <div className="bg-white shadow-sm flex flex-col p-2 rounded border border-gray-700 space-y-2">
      <div
        className="flex justify-between hover:opacity-100 opacity-50 cursor-pointer"
        title="Live Reactions"
        onClick={() => setAppState((old) => ({ ...old, reactionPickerOpen: !old.reactionPickerOpen }))}
      >
        {!appState?.reactionPickerOpen && <FaRegWindowMaximize size={15} />}
        {appState?.reactionPickerOpen && (
          <>
            <span className="font-bold">Live Reactions</span>
            <FaRegWindowMinimize size={15} />
          </>
        )}
      </div>

      {appState?.reactionPickerOpen && (
        <div className="space-x-1">
          {reactions.map((reaction) => (
            <button
              className="cursor-pointer select-none text-xl hover:bg-blue-200 p-2 rounded"
              key={reaction}
              onClick={() => onReaction(reaction)}
            >
              {reaction}
            </button>
          ))}
        </div>
      )}

      {appState?.reactionPickerOpen && (
        <input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          type="text"
          className="border hidden md:block border-gray-700 p-2"
          placeholder="send message..."
          onKeyPress={onTextSubmit}
        />
      )}
    </div>
  );
};

export default ReactionPicker;
