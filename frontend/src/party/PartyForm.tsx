import ReactDatePicker from 'react-date-picker';
import { Controller, useForm } from 'react-hook-form';
import { PartyResponse } from '../api/api-models';

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import Input from "../components/Input";
import Select from "../components/Select";
import DatePicker from "../components/DatePicker";

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
    <form id="party-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Name" name="name" type="text" optional={false} props={register('name', {required: true})} />
      <Input label="Description" name="description" type="text" optional={false} props={register('description', {required: true})} />
      <Select label="Category" name='category' options={new Map([["photo", "Photo Challenge"]])} props={register('category', { required: true })} />
      <div className="flex space-x-8">
        <DatePicker label="Submission Start Date" name="startDate" control={control} />
        <DatePicker label="Submission End Date" name="endDate" control={control} />
      </div>
      <input
        className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded mt-4 cursor-pointer"
        value={submitBtnText}
        disabled={formState.isSubmitting}
        type="submit"
      />
    </form>
  );
}

export default PartyForm;
