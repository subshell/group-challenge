import { FaInfo, FaLink } from 'react-icons/fa';
import EmojiBar from '../../components/EmojiBar';

function ViewPartyStartPage({
  isHost,
  participants,
  partyName,
  onPartyStart,
}: {
  isHost: boolean;
  participants: number;
  partyName: string;
  onPartyStart: () => any;
}) {
  return (
    <div className="flex flex-col items-center justify-between align-middle space-y-10">
      <h2 className="text-4xl font-bold">- {partyName} -</h2>
      <div className="flex space-x-8 items-center">
        <p className="font-bold">Share link:</p>
        <span className="flex items-center border border-blue-500 rounded p-2 pl-4 pr-4 font-bold bg-white dark:bg-slate-900">
          <FaLink className="mr-2" /> <span>{window.location.href}</span>
        </span>
      </div>
      {isHost && (
        <>
          <div className="flex items-center border-2 border-blue-500 px-4 py-3 rounded" role="alert">
            <FaInfo className="mr-2" />

            <div className="ml-8 leading-8">
              <span className="font-medium">Here are some useful tips to get you started:</span>
              <ul className="list-disc list-inside">
                <li>Your friends can join at any time, even after the party has started.</li>
                <li>
                  Only you see the party control buttons: <b>start</b>, <b>next image</b> and <b>previous image</b>.
                </li>
                <li>
                  Every submission has an automatic timer, but you still have to go to the next submission manually.
                </li>
                <li>You can go to the next submission whenever you feel like it, regardless of the current timer.</li>
                <li>The last page is a leaderboard.</li>
              </ul>
            </div>
          </div>
        </>
      )}
      {!isHost && <div>Waiting for party host to press start...</div>}

      <div className="flex flex-col items-center space-y-4" title="participants">
        <span className="text-xl font-bold">{participants} participant(s)</span>
        <EmojiBar count={participants} />
      </div>

      {isHost && (
        <button
          className="flex flex-grow items-center justify-center p-4 pr-32 pl-32 space-x-2 border bg-green-500 text-white cursor-pointer hover:opacity-70 rounded shadow-lg hover:shadow-xl"
          onClick={onPartyStart}
        >
          Start
        </button>
      )}
    </div>
  );
}

export default ViewPartyStartPage;
