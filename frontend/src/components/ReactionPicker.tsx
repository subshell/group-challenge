import { FunctionComponent, useCallback, useState } from 'react';
import { FaRegMessage, FaX } from 'react-icons/fa6';
import { useAppState } from '../user/appState';

const ReactionPicker: FunctionComponent<{ onReaction: (reaction: string) => void }> = ({ onReaction }) => {
  const [appState, setAppState] = useAppState();
  const [textInput, setTextInput] = useState('');

  const onTextSubmit = useCallback(
    (text: string) => {
      if (textInput) {
        onReaction(textInput);
        setTextInput('');
      }
    },
    [onReaction, setTextInput, textInput]
  );

  return (
    <div className="bg-white shadow-sm flex flex-col p-2 rounded border border-slate-500 dark:bg-slate-900">
      <div
        className="hover:opacity-100 opacity-50 cursor-pointer"
        title="Live Reactions"
        onClick={() => setAppState((old) => ({ ...old, reactionPickerOpen: true }))}
      >
        {!appState?.reactionPickerOpen && <FaRegMessage size={15} />}
      </div>
      {appState?.reactionPickerOpen && (
        <div className="flex space-x-4">
          <input
            className="shadow appearance-none border rounded w-full py-1 px-3 text-black"
            placeholder="Type a message..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                onTextSubmit(textInput);
              } else if (event.key === 'Escape') {
                setAppState((old) => ({ ...old, reactionPickerOpen: false }));
              }
            }}
          />
          <button onClick={() => setAppState((old) => ({ ...old, reactionPickerOpen: false }))}>
            <FaX size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReactionPicker;
