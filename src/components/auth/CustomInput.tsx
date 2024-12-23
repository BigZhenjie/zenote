const CustomInput = ({
  label,
  placeholder,
  type,
  value,
  onChange,
}: CustomInputProps) => {
  return (
    <div className="flex flex-col justify-center gap-1 w-full">
      <label className="text-xs font-medium">{label}</label>
      <input
        className="outline-none border border-gray-200 rounded-lg p-1 w-full placeholder:text-sm placeholder:text-gray-400 focus:ring-blue-300"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default CustomInput;
