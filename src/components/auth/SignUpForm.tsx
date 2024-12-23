import avatar from "/auth/avatar.png";
import CustomInput from "./CustomInput";
import { useState } from "react"
const SignUpForm = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <button className="bg-gray-100 rounded-full p-2 hover:bg-gray-50">
        <img
          src={avatar}
          alt="avatar"
          className="w-12 h-12 rounded-full opacity-10"
        />
      </button>

      <button className="p-1 px-2 hover:bg-gray-100 rounded-lg">Upload</button>

      <div className="flex flex-col items-center justify-center gap-4">
        <CustomInput
          label="First Name"
          placeholder="Enter your first name"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <CustomInput
          label="Last Name"
          placeholder="Enter your last name"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <CustomInput
          label="Set a password"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
          
    </div>
  );
};

export default SignUpForm;
