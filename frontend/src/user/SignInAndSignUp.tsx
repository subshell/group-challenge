import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

export type MethodType = 'signIn' | 'signUp';

export function SignIn() {
  return (
    <div className="px-8 pt-6 pb-8 flex flex-col">
      <div className="mb-8">
        <div className="p-4 bg-indigo-800 items-center text-indigo-100 leading-none flex" role="alert">
          <span className="font-semibold mr-2 text-left flex-auto">Don't have an account?</span>
          <Link className="flex rounded-full bg-indigo-500 uppercase px-3 py-1 text-xs font-bold mr-3" to="/signup">
            Sign Up
          </Link>
        </div>
      </div>
      <SignInForm />
    </div>
  );
}

export function SignUp() {
  return (
    <div className="px-8 pt-6 pb-8 flex flex-col">
      <div className="mb-8">
        <Link
          className="flex place-items-center space-x-1 text-indigo-500 px-3 py-1 text-xs font-bold mr-3"
          to="/signin"
        >
          <FaArrowLeft />
          <div>Back</div>
        </Link>
      </div>
      <SignUpForm />
    </div>
  );
}
