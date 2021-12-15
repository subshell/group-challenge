import { FunctionComponent, useCallback, useState } from 'react';
import { FaRegWindowMaximize, FaRegWindowMinimize } from 'react-icons/fa';
import { useAppState } from '../user/appState';
import InputEmoji from 'react-input-emoji';

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
    <div className="bg-white shadow-sm flex flex-col p-2 rounded border border-gray-700 space-y-4">
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
        <InputEmoji
          value={textInput}
          onChange={setTextInput}
          maxlength={64}
          onEnter={onTextSubmit}
          borderRadius={4}
          placeholder="Type a message"
        />
      )}
    </div>
  );
};

export default ReactionPicker;
