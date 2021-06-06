import { FaMedal } from 'react-icons/fa';
import { ReactComponent as Trophy } from './trophy.svg';

function PartyPosition({ position }: { position: number }) {
  return (
    <>
      {position === 0 && <Trophy />}
      {position === 1 && <FaMedal size={48} color="silver" />}
      {position === 2 && <FaMedal size={48} color="brown" />}
      {position > 2 && <div className="text-4xl mr-5">{position + 1}.</div>}
    </>
  );
}

export default PartyPosition;
