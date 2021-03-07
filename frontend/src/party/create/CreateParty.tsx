import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { createParty } from '../../api';
import { useSession } from '../../user/session';

export interface PartyFormData {
  name: string;
  description: string;
  category: 'photo';
  startDate: Date;
  endDate: Date;
}

function CreateParty() {
  const { register, handleSubmit } = useForm<PartyFormData>();
  const [session] = useSession();
  const { mutate } = useMutation(createParty);
  const onSubmit = (data: PartyFormData) => {
    mutate({ party: data, sessionToken: session!.token });
  };
  return (
    <div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
            ref={register({ required: true })}
            type="text"
            id="name"
            name="name"
          />
        </div>

        <div>
          <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>

          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
            ref={register({ required: true })}
            id="description"
            name="description"
          />
        </div>

        <div>
          <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="category">
            Category
          </label>

          <select
            ref={register({ required: true })}
            id="category"
            name="category"
            className="shadow border rounded w-full py-2 px-3 text-grey-darker"
          >
            <option value="photo">Photo Challenge</option>
          </select>
        </div>

        <div>
          <div className="flex space-between space-x-2">
            <div className="w-full">
              <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="startDate">
                Start Date
              </label>
              <input
                className="shadow border rounded w-full py-2 px-3 text-grey-darker"
                type="datetime-local"
                ref={register({ required: true, setValueAs: (v) => new Date(v) })}
                name="startDate"
              />
            </div>
            <div className="w-full">
              <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="endDate">
                End Date
              </label>
              <input
                className="shadow border rounded w-full py-2 px-3 text-grey-darker"
                type="datetime-local"
                ref={register({ required: true, setValueAs: (v) => new Date(v) })}
                name="endDate"
              />
            </div>
          </div>
        </div>

        <input
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded"
          value="Create Party"
          type="submit"
        />
      </form>
    </div>
  );
}

export default CreateParty;
