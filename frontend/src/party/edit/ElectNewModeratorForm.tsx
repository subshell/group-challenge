import { FunctionComponent } from 'react';
import { useForm } from 'react-hook-form';
import { useUsers } from '../../api/api';
import { useSession } from '../../user/session';
import Select from "../../components/Select";

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
      <Select label="New Moderator" name="new_moderator" options={new Map(possibleModerators.map((user) => [user.id, user.username]))}
              props={register('new_moderator', { required: true })} />

      <input
        className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded cursor-pointer"
        value="Elect new moderator"
        disabled={formState.isSubmitting}
        type="submit"
      />
    </form>
  );
};

export default ElectNewModeratorForm;
