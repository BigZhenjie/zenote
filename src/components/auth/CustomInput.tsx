const CustomInput = ({
  label,
  placeholder,
  type,
  value,
  onChange,
}: CustomInputProps) => {
  return (
    <div className="flex flex-col justify-center max-w-[300px] w-full">
      <label className="text-xs font-medium mb-1 text-gray-500">{label}</label>
      <div className="relative flex items-center w-full text-sm leading-5 rounded-md shadow-[inset_0_0_0_1px_rgba(15,15,15,0.1)] bg-transparent cursor-text p-[4px_10px] h-[31px] focus-within:shadow-[inset_0_0_0_2px_lightblue]">
        <input
          className="w-full border-none bg-transparent resize-none p-0 focus:outline-none"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};



export default CustomInput;
