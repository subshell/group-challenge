function Button(props: any) {
  return (
    <button className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded" type="button" {...props}>
      {props.children}
    </button>
  );
}
export default Button;
