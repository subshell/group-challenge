import {Controller} from "react-hook-form";
import ReactDatePicker from "react-date-picker";

function DatePicker({ label, name, control }: { label: string; name: string; control: any }) {
	return (
		<div>
			<label className="block text-sm font-bold mb-2" htmlFor={name}>
				{label}
			</label>
			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<ReactDatePicker
						value={new Date(field.value)}
						className="bg-white shadow rounded w-full text-black"
						onChange={field.onChange}
					/>
				)}
			/>
		</div>
	);
}

export default DatePicker;
