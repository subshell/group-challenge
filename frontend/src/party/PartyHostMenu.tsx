import { Menu, Transition } from '@headlessui/react';
import { useMutation } from '@tanstack/react-query';
import { Fragment, FunctionComponent } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import { reopenParty, startParty, usePartyStatus } from '../api/api';
import { isPartyLive, PartyResponse } from '../api/api-models';
import { useSession } from '../user/session';

export const PartyHostMenu: FunctionComponent<{ party: PartyResponse }> = ({ party }) => {
  const { mutateAsync: startMutateAsync } = useMutation(startParty);
  const [session] = useSession();
  const partyStatus = usePartyStatus(party.id);
  const { mutateAsync: reopenPartyMutateAsync } = useMutation(reopenParty);
  const isLive = partyStatus.isSuccess && isPartyLive(partyStatus.data);
  const isHost = party?.userId === session?.userId;

  const onStartPartyButton = async () => {
    if (isLive) {
      return;
    }

    await startMutateAsync({ partyId: party.id, sessionToken: session!.token });
  };

  const onReopenPartyButton = async () => {
    if (!isHost || !party?.done) {
      return;
    }

    const result = window.confirm('Are you sure you want to reopen the party? This will reset all votes!');
    if (!result) {
      return;
    }

    await reopenPartyMutateAsync({ partyId: party.id, sessionToken: session!.token });
  };

  return (
    <div>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className=" justify-center rounded-full p-2 hover:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
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
          <Menu.Items className="absolute w-56 mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="px-1 py-1 ">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href={'party/edit/' + party.id}
                    className={`${
                      active ? 'bg-slate-800 text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    Edit
                  </a>
                )}
              </Menu.Item>
              {!party.done && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onStartPartyButton}
                      className={`${
                        active ? 'bg-slate-800 text-white' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      Start
                    </button>
                  )}
                </Menu.Item>
              )}
              {party.done && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onReopenPartyButton}
                      className={`${
                        active ? 'bg-slate-800 text-white' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      Reopen
                    </button>
                  )}
                </Menu.Item>
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};
