import { useParams } from 'react-router';

function PostPartyItem() {
  const { id } = useParams<{ id: string }>();
  return <>Post party entry {id}</>;
}

export default PostPartyItem;
