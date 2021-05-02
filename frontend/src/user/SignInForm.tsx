import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { signIn } from '../api/api';
import { useSession } from './session';

function SignInForm() {
  const [, setSession] = useSession();

  const { register, handleSubmit, formState } = useForm<{ username: string; password: string }>();
  const onSubmit = async ({ username, password }: { username: string; password: string }) => {
    try {
      const session = await signIn(username, password);
      if (!session) {
        toast('invalid login', { type: 'error' });
        return;
      }

      setSession(session);
    } catch (e) {
      console.error(e);
      alert('Cannot reach backend service');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="username">
          Username
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
          type="text"
          {...register('username', { required: true })}
        />
        <p>{formState.errors.username && <span>This field is required</span>}</p>
      </div>
      <div className="mb-6">
        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input
          className="shadow appearance-none border border-red rounded w-full py-2 px-3 text-grey-darker mb-3"
          type="password"
          {...register('password', { required: true })}
        />
        <p>{formState.errors.password && <span>This field is required</span>}</p>
      </div>
      <div className="flex items-center justify-between">
        <input
          type="submit"
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded"
          value="Sign In"
        />
      </div>
    </form>
  );
}

export default SignInForm;
