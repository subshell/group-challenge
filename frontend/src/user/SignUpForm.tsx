import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { signIn, signUp } from '../api/api';
import { useSession } from './session';
import Input from "../components/Input";

interface FormData {
  username: string;
  password: string;
  email: string;
  confirmpassword?: string;
}

function SignUpForm() {
  const [, setSession] = useSession();
  const signUpMutation = useMutation({
    mutationFn: signUp,
  });
  const { watch, register, handleSubmit, formState, setError, setFocus } = useForm<FormData>();

  const onSubmit = async ({ username, password, email }: FormData) => {
    const userResponse = await signUpMutation.mutateAsync({ username, password, email });

    if (!userResponse) {
      return <></>;
    }

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
    <form id="sign-up-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <Input label="Username *" name="username" type="text" optional={false} props={register('username', { required: true, pattern: /^[a-zA-Z0-9]{2,}$/ })}/>
        <p>
          {formState.errors.username && (
            <>
              {formState.errors.username.type !== 'notAvailable' && (
                <span className="text-red-600">This field is required and must only use alphanumerical characters (a-z, A-Z, 0-9)</span>
              )}
              {formState.errors.username.type === 'notAvailable' && <span>Username is not available</span>}
            </>
          )}
        </p>
      </div>
      <div className="mb-4">
        <Input label="Email *" name="email" type="email" optional={false} props={register('email', { required: true})}/>
        <p>{formState.errors.email && <span className="text-red-600">Error</span>}</p>
      </div>

      <div className="mb-4">
        <Input label="Password *" name="password" type="password" optional={false} props={register('password', { required: true, minLength: 2 })}/>
        <p>{formState.errors.password && <span className="text-red-600">This field is required and must be longer than 2 characters</span>}</p>
      </div>
      <div className="mb-4">
        <Input label="Repeat Password *" name="password" type="password" optional={false} props={register('confirmpassword', { required: true, validate: (value) => watch('password') === value })}/>
        <p>{formState.errors.confirmpassword?.type === 'required' && <span className="text-red-600">This field is required</span>}</p>
        <p>{formState.errors.confirmpassword?.type === 'validate' && <span className="text-red-600">The passwords don't match</span>}</p>
      </div>
      <div className="flex items-center justify-between">
        <input
          type="submit"
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded cursor-pointer"
          value="Sign Up"
        />
      </div>
    </form>
  );
}

export default SignUpForm;
