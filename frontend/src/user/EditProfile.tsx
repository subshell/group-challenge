import { useUser } from '../api';
import { useSession } from './session';

function EditProfile() {
  const [session] = useSession();
  const { data: user } = useUser(session!.userId);

  return (
    <div>
      <h1 className="text-2xl mb-4">Profile</h1>
      <div>
        <p>id: {user?.id}</p>
        <p>email: {user?.email}</p>
        <p>username: {user?.username}</p>
      </div>
    </div>
  );
}

export default EditProfile;
