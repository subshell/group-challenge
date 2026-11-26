function Select({
  label,
  name,
  options,
  props,
}: {
  label: string;
  name: string;
  options: Map<string, string>;
  props?: any;
}) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2" htmlFor={name}>
        {label}
      </label>
      <select
        className="bg-white dark:bg-slate-600 shadow border border-gray-300 dark:border-slate-900 rounded w-full py-2 px-3"
        {...props}
      >
        {Array.from(options).map(([key, value]) => (
          <option key={key} value={key}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Select;
