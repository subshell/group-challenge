import { Link } from 'react-router-dom';

function LinkButton({ to, text }: { to: string; text: string }) {
  return (
    <Link to={to}>
      <button className="inline-flex border border-1 border-black py-1 px-3 hover:bg-gray-200 text-sm">{text}</button>
    </Link>
  );
}

export default LinkButton;
