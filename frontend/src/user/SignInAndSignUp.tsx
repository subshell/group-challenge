import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

export type MethodType = 'signIn' | 'signUp';

export function SignIn() {
  return (
    <div className="px-8 pt-6 pb-8 flex flex-col">
      <SignInForm />
      <div className="mt-8">
        <span className="font-semibold mr-2 text-left flex-auto">Don't have an account?</span>
        <Link className="hover:underline" to="/signup">
          Sign Up here
        </Link>
      </div>
    </div>
  );
}

export function SignUp() {
  return (
    <div className="px-8 pt-6 pb-8 flex flex-col">
      <div className="mb-8">
        <Link className="flex place-items-center space-x-2 font-bold" to="/signin">
          <FaArrowLeft />
          <div>Back</div>
        </Link>
      </div>
      <SignUpForm />
    </div>
  );
}
