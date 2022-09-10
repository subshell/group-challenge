import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { FaRegWindowMaximize, FaRegWindowMinimize } from 'react-icons/fa';
import { useAppState } from '../user/appState';

const ReactionPicker: FunctionComponent<{ onReaction: (reaction: string) => void }> = ({ onReaction }) => {
  const [appState, setAppState] = useAppState();
  const [textInput, setTextInput] = useState('');
  const [EmojiPicker, setEmojiPicker] = useState<any>();
  const onTextSubmit = useCallback(
    (text: string) => {
      if (textInput) {
        onReaction(textInput);
        setTextInput('');
      }
    },
    [onReaction, setTextInput, textInput]
  );

  useEffect(() => {
    import('react-input-emoji').then((module) => setEmojiPicker(module.default));
  }, []);

  return (
    <div className="bg-white shadow-sm flex flex-col p-2 rounded border border-slate-500 space-y-4 dark:bg-slate-900">
      <style>
        {`.react-input-emoji--container {
          margin: 0 !important;
          width: 300px !important;
        }`}
      </style>
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

      {EmojiPicker && appState?.reactionPickerOpen && (
        <EmojiPicker
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
