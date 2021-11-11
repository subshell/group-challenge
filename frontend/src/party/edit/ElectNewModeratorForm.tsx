import { FunctionComponent } from 'react';
import { useForm } from 'react-hook-form';
import { useUsers } from '../../api/api';
import { useSession } from '../../user/session';

export interface ElectNewModeratorFormData {
  new_moderator: string;
}

const ElectNewModeratorForm: FunctionComponent<{ onSubmit: (data: ElectNewModeratorFormData) => void }> = ({
  onSubmit,
}) => {
  const [session] = useSession();
  const { data: users } = useUsers();
  const { register, handleSubmit, formState } = useForm<ElectNewModeratorFormData>({
    defaultValues: {
      new_moderator: undefined,
    },
  });

  const possibleModerators = (users || [])
    .filter((user) => user.id !== session?.userId)
    .sort((a, b) => (a.username === b.username ? 0 : a.username < b.username ? -1 : 1));

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="new_moderator">
          New Moderator
        </label>

        <select
          className="shadow border rounded w-full py-2 px-3 text-grey-darker"
          {...register('new_moderator', { required: true })}
        >
          {possibleModerators.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>

      <input
        className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded"
        value="Elect new moderator"
        disabled={formState.isSubmitting}
        type="submit"
      />
    </form>
  );
};

export default ElectNewModeratorForm;
