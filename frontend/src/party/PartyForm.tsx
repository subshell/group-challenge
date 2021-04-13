import ReactDatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import { PartyResponse } from '../api-models';

export interface PartyFormData {
  name: string;
  description: string;
  category: 'photo';
  startDate: Date;
  endDate: Date;
}

export interface PartyFormProps {
  onSubmit: (data: PartyFormData) => any;
  initialData?: Partial<PartyResponse>;
  submitBtnText?: string;
}

function PartyForm({ onSubmit, submitBtnText = 'Save', initialData = {} }: PartyFormProps) {
  const { register, handleSubmit, formState, control } = useForm<PartyFormData>({
    defaultValues: {
      ...initialData,
      startDate: initialData.startDate ?? new Date(),
      endDate: initialData.endDate ?? new Date(),
    },
  });

  return (
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
        <div className="flex space-x-8">
          <div>
            <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="startDate">
              Submission Start Date
            </label>
            <Controller
              name="startDate"
              control={control}
              render={({ onChange, value }) => (
                <ReactDatePicker
                  className="shadow border rounded w-full py-2 px-3 text-grey-darker"
                  selected={new Date(value)}
                  onChange={onChange}
                />
              )}
            />
          </div>
          <div>
            <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="endDate">
              Submission End Date
            </label>
            <Controller
              name="endDate"
              control={control}
              render={({ onChange, value }) => (
                <ReactDatePicker
                  className="shadow border rounded w-full py-2 px-3 text-grey-darker"
                  selected={new Date(value)}
                  onChange={onChange}
                />
              )}
            />
          </div>
        </div>
      </div>

      <input
        className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded"
        value={submitBtnText}
        disabled={formState.isSubmitting}
        type="submit"
      />
    </form>
  );
}

export default PartyForm;
