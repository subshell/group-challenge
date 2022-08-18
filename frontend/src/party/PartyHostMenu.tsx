import { Menu, Transition } from '@headlessui/react';
import { useMutation } from '@tanstack/react-query';
import { Fragment, FunctionComponent } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import { startParty, usePartyStatus } from '../api/api';
import { isPartyLive, PartyResponse } from '../api/api-models';
import { useSession } from '../user/session';

export const PartyHostMenu: FunctionComponent<{ party: PartyResponse }> = ({ party }) => {
  const { mutateAsync: startMutateAsync } = useMutation(startParty);
  const [session] = useSession();
  const partyStatus = usePartyStatus(party.id);

  const isLive = partyStatus.isSuccess && isPartyLive(partyStatus.data);

  const onStartPartyButton = async () => {
    if (isLive) {
      return;
    }

    await startMutateAsync({ partyId: party.id, sessionToken: session!.token });
  };

  return (
    <div>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex items-center justify-center space-x-2 rounded-full border-2 border-white px-4 py-2 hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            <FaEllipsisV />
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
          <Menu.Items className="absolute mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="px-1 py-1 ">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href={'party/edit/' + party.id}
                    className={`${
                      active ? 'bg-blue-500 text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    Edit
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onStartPartyButton}
                    className={`${
                      active ? 'bg-blue-500 text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    Start
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};
