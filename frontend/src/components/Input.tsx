function Input({ label, name, type, optional, props }: { label: string; name: string; type: string; optional: boolean; props?: any }) {
	return (
		<div>
			<label className="block text-sm font-bold mb-2" htmlFor={name}>
				{label}
				{optional && (
					<span className="text-gray-500"> (optional)</span>
				)}
			</label>
			<input
				className="bg-white dark:bg-slate-600 shadow appearance-none border border-gray-300 dark:border-slate-900 rounded w-full py-2 px-3 focus:border-blue-400 focus:outline-hidden transition-colors"
				type={type}
				{...props}
			/>
		</div>
	);
}

export default Input;
