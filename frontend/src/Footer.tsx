import { FunctionComponent } from 'react';

export const Footer: FunctionComponent = () => {
  return (
    <footer className="m-4 p-4 md:flex md:items-center md:justify-between md:p-6">
      <span className="text-sm sm:text-center">
        <a href="/" className="hover:underline">
          Group Challenge
        </a>
      </span>
      <ul className="flex flex-wrap items-center mt-3 text-sm sm:mt-0">
        <li>
          <a href="https://github.com/subshell/group-challenge" className="mr-4 hover:underline md:mr-6 ">
            Github
          </a>
        </li>
        <li>
          <a href="https://github.com/subshell/group-challenge/issues" className="mr-4 hover:underline md:mr-6 ">
            Issues
          </a>
        </li>
      </ul>
    </footer>
  );
};
