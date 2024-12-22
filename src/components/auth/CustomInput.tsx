const CustomInput = ({label, placeholder, type, value, onChange} : CustomInputProps) => {
  return (
    <div>
      <label>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  )
}

export default CustomInput