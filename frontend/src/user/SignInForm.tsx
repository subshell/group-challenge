import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { signIn } from '../api/api';
import { useSession } from './session';
import Input from '../components/Input';

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
    <form id="sign-in-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <Input
          label="Email or Username"
          name="emailOrUsername"
          type="text"
          optional={false}
          props={register('emailOrUsername', { required: true })}
        />
        <p>{formState.errors.emailOrUsername && <span className="text-red-600">This field is required</span>}</p>
      </div>
      <div className="mb-6">
        <Input
          label="Password"
          name="password"
          type="password"
          optional={false}
          props={{ autoComplete: 'currnet-password', ...register('password', { required: true }) }}
        />
        <p>{formState.errors.password && <span className="text-red-600">This field is required</span>}</p>
      </div>
      <div className="flex items-center justify-between">
        <input
          type="submit"
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded cursor-pointer"
          value="Sign In"
        />
      </div>
    </form>
  );
}

export default SignInForm;
