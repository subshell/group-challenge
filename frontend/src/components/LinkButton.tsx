import { Link } from 'react-router-dom';
import Button from './Button';

function LinkButton({ to, text }: { to: string; text: string }) {
  return (
    <Link to={to}>
      <Button>{text}</Button>
    </Link>
  );
}

export default LinkButton;
