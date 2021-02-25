function Button(props: any) {
  return (
    <button
      className="bg-gray-800 hover:bg-gray-400 text-gray-200 font-bold py-2 px-4 rounded"
      type="button"
      {...props}
    >
      {props.children}
    </button>
  );
}
export default Button;
