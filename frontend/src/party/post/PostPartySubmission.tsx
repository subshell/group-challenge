import { useParams } from 'react-router';

function PostPartySubmission() {
  const { id } = useParams<{ id: string }>();
  return <>Post party entry {id}</>;
}

export default PostPartySubmission;
