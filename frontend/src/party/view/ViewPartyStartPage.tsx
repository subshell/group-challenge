import { FaInfo, FaLink, FaSmileBeam } from 'react-icons/fa';
import Button from '../../components/Button';

function ViewPartyStartPage({
  isHost,
  participants,
  onPartyStart,
}: {
  isHost: boolean;
  participants: number;
  onPartyStart: () => any;
}) {
  return (
    <div className="flex flex-col items-center justify-center align-middle space-y-8">
      {isHost && (
        <>
          <div className="flex items-center bg-blue-500 text-white px-4 py-3" role="alert">
            <FaInfo className="mr-2" />

            <div className="ml-8">
              <span className="font-medium">Here are some useful tips to get you started:</span>
              <ul className="list-disc list-inside">
                <li>Your friends can join at any time (even after the party has started).</li>
                <li>
                  Only you see the party control buttons: <b>start</b>, <b>next image</b> and <b>previous image</b>.
                </li>
                <li>
                  Every submission has an automatic timer, but you still have to go to the next submission manually.
                </li>
                <li>You can go to the next submission whenever you feel like it, regardless of the current timer.</li>
                <li>Everyone will see a final ranking at the end.</li>
              </ul>
            </div>
          </div>
          <Button onClick={onPartyStart}>Start</Button>
        </>
      )}
      {!isHost && <div>Wating for party host to press start...</div>}

      <div className="flex flex-col items-center space-y-4" title="participants">
        <span className="text-xl font-bold">{participants} participant(s)</span>
        <span className="flex flex-row text-4xl space-x-2">
          {Array(participants)
            .fill(0)
            .map((_, i) => (
              <FaSmileBeam key={i} color="green" />
            ))}
        </span>
      </div>

      <div className="flex space-x-8 items-center fixed bottom-8 bg-white">
        <p className="font-bold">Share link:</p>
        <span className="flex items-center border border-blue-500 rounded p-2 pl-4 pr-4 font-bold">
          <FaLink className="mr-2" /> <span>{window.location.href}</span>
        </span>
      </div>
    </div>
  );
}

export default ViewPartyStartPage;
