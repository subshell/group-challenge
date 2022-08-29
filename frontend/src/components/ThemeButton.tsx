import { Menu, Transition } from '@headlessui/react';
import { Fragment, useEffect, type FunctionComponent } from 'react';
import { FaArrowDown, FaAutoprefixer, FaLightbulb, FaMoon } from 'react-icons/fa';
import { Theme, useTheme } from '../theme';

export const ThemeButton: FunctionComponent = () => {
  const [theme, setTheme] = useTheme();

  useEffect(() => {
    if (!theme) {
      setTheme('os');
    }
  }, [theme, setTheme]);

  const MenuItem: FunctionComponent<{ label: string; value: Theme; icon: any }> = ({ label, value, icon }) => {
    return (
      <Menu.Item>
        {({ active }) => (
          <button
            onClick={() => setTheme(value)}
            className={`${
              active ? 'bg-slate-700 text-white' : 'text-gray-900'
            } group flex w-full items-center rounded-md px-2 py-2 text-sm space-x-2`}
          >
            {icon}
            <span>{label}</span>
          </button>
        )}
      </Menu.Item>
    );
  };

  return (
    <div className="flex items-center">
      <Menu as="div" className="relative items-center text-left">
        <div>
          <Menu.Button className="inline-flex items-center space-x-2 justify-center rounded-md hover:underline hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-opacity-75">
            <span>
              <span className="bg-blue-600 text-white rounded px-1 py-0.5 mr-2">new</span>
              Theme
            </span>
            <FaArrowDown aria-hidden="true" />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute z-10 left-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1 ">
              <MenuItem label="Light" value="light" icon={<FaLightbulb />} />
              <MenuItem label="Dark" value="dark" icon={<FaMoon />} />
              <MenuItem label="Auto" value="os" icon={<FaAutoprefixer />} />
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};
