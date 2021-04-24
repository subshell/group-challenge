import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { signIn, signUp } from '../api';
import { useSession } from './session';

interface FormData {
  username: string;
  password: string;
  email: string;
  confirmpassword: string;
}

function SignUpForm() {
  const [, setSession] = useSession();
  const signUpMutation = useMutation(signUp);
  const { watch, register, handleSubmit, formState, setError, setFocus } = useForm<FormData>();

  const onSubmit = async ({ username, password, email }: FormData) => {
    const userResponse = await signUpMutation.mutateAsync({ username, password, email });
    if (userResponse.status !== 200) {
      if (userResponse.status === 422) {
        toast(`Sorry, the user ${username} already exists`, { type: 'error' });
        setError('username', { type: 'notAvailable' });
        setFocus('username');
      } else {
        toast('Sign up error', { type: 'error' });
      }
      return;
    }

    const userWithToken = await signIn(username, password);
    if (!userWithToken) {
      toast('Sign in error', { type: 'error' });
      return;
    }

    setSession(userWithToken);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="username">
          Username *
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
          type="text"
          {...register('username', { required: true, pattern: /^[a-zA-Z0-9]{2,}$/ })}
        />
        <p>
          {formState.errors.username && (
            <>
              {formState.errors.username.type !== 'notAvailable' && (
                <span>This field is required and must only use alphanumerical characters (a-z, A-Z, 0-9)</span>
              )}
              {formState.errors.username.type === 'notAvailable' && <span>Username is not available</span>}
            </>
          )}
        </p>
      </div>
      <div className="mb-4">
        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="username">
          Email
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
          type="email"
          {...register('email')}
        />
        <p>{formState.errors.email && <span>Error</span>}</p>
      </div>
      <div className="mb-4">
        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="password">
          Password *
        </label>
        <input
          className="shadow appearance-none border border-red rounded w-full py-2 px-3 text-grey-darker"
          type="password"
          {...register('password', { required: true, minLength: 2 })}
        />
        <p>{formState.errors.password && <span>This field is required and must be longer than 2 characters</span>}</p>
      </div>
      <div className="mb-4">
        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="password">
          Repeat Password *
        </label>
        <input
          className="shadow appearance-none border border-red rounded w-full py-2 px-3 text-grey-darker"
          type="password"
          {...register('confirmpassword', { required: true, validate: (value) => watch('password') === value })}
        />
        <p>{formState.errors.confirmpassword?.type === 'required' && <span>This field is required</span>}</p>
        <p>{formState.errors.confirmpassword?.type === 'validate' && <span>The passwords don't match</span>}</p>
      </div>
      <div className="flex items-center justify-between">
        <input
          type="submit"
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded"
          value="Sign Up"
        />
      </div>
    </form>
  );
}

export default SignUpForm;
