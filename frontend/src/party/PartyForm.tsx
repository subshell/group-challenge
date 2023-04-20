import ReactDatePicker from 'react-date-picker';
import { Controller, useForm } from 'react-hook-form';
import { PartyResponse } from '../api/api-models';

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

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
      startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
      endDate: initialData.endDate ? new Date(initialData.endDate) : new Date(),
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block text-sm font-bold mb-2" htmlFor="name">
          Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black"
          type="text"
          {...register('name', { required: true })}
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2" htmlFor="description">
          Description
        </label>

        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black"
          {...register('description', { required: true })}
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2" htmlFor="category">
          Category
        </label>

        <select
          className="shadow border rounded w-full py-2 px-3 text-black"
          {...register('category', { required: true })}
        >
          <option value="photo">Photo Challenge</option>
        </select>
      </div>

      <div>
        <div className="flex space-x-8">
          <div>
            <label className="block text-sm font-bold mb-2" htmlFor="startDate">
              Submission Start Date
            </label>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <ReactDatePicker
                  value={new Date(field.value)}
                  className="shadow rounded w-full text-black dark:bg-white"
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2" htmlFor="endDate">
              Submission End Date
            </label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <ReactDatePicker
                  className="shadow rounded w-full text-black dark:bg-white"
                  value={new Date(field.value)}
                  onChange={field.onChange}
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
