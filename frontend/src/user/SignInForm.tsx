import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { signIn } from '../api/api';
import { useSession } from './session';

interface FormData {
  emailOrUsername: string;
  password: string;
}

function SignInForm() {
  const [, setSession] = useSession();

  const { register, handleSubmit, formState } = useForm<FormData>();
  const onSubmit = async ({ emailOrUsername, password }: FormData) => {
    try {
      const session = await signIn(emailOrUsername, password);
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
        <label className="block text-sm font-bold mb-2" htmlFor="emailOrUsername">
          Email or Username
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black"
          type="text"
          {...register('emailOrUsername', { required: true })}
        />
        <p>{formState.errors.emailOrUsername && <span>This field is required</span>}</p>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input
          className="shadow appearance-none border border-red rounded w-full py-2 px-3 text-black mb-3"
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
