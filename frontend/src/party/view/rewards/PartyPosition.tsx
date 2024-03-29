import { FaMedal } from 'react-icons/fa';
import TrophyUrl from '/src/assets/trophy.svg';

function PartyPosition({ position }: { position: number }) {
  return (
    <>
      {position === 0 && <img src={TrophyUrl} />}
      {position === 1 && <FaMedal size={48} color="silver" />}
      {position === 2 && <FaMedal size={48} color="brown" />}
      {position > 2 && <div className="text-4xl">{position + 1}.</div>}
    </>
  );
}

export default PartyPosition;
