import { useForm } from 'react-hook-form';
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
  const { watch, register, handleSubmit, errors } = useForm<FormData>();
  const onSubmit = async ({ username, password, email }: FormData) => {
    const user = await signUp(username, password, email);
    if (!user) {
      alert('Sign Up error');
      return;
    }

    const userWithToken = await signIn(username, password);
    if (!userWithToken) {
      alert('Sign In error');
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
          id="username"
          name="username"
          type="text"
          ref={register({ required: true })}
        />
        <p>{errors.username && <span>This field is required</span>}</p>
      </div>
      <div className="mb-4">
        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="username">
          Email
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
          id="email"
          name="email"
          type="email"
          ref={register()}
        />
        <p>{errors.email && <span>Error</span>}</p>
      </div>
      <div className="mb-4">
        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="password">
          Password *
        </label>
        <input
          className="shadow appearance-none border border-red rounded w-full py-2 px-3 text-grey-darker mb-3"
          id="password"
          name="password"
          type="password"
          ref={register({ required: true })}
        />
        <p>{errors.password && <span>This field is required</span>}</p>
      </div>
      <div className="mb-4">
        <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="password">
          Repeat Password *
        </label>
        <input
          className="shadow appearance-none border border-red rounded w-full py-2 px-3 text-grey-darker mb-3"
          id="confirmpassword"
          name="confirmpassword"
          type="password"
          ref={register({ required: true, validate: (value) => watch('password') === value })}
        />
        <p>{errors.confirmpassword?.type === 'required' && <span>This field is required</span>}</p>
        <p>{errors.confirmpassword?.type === 'validate' && <span>The passwords don't match</span>}</p>
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
