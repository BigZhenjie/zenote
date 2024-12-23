import avatar from "/auth/avatar.png";
import CustomInput from "./CustomInput";
import { useState } from "react";

const SignUpForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [avatarImage, setAvatarImage] = useState<string>(avatar);

  interface FormData {
    firstName: string;
    lastName: string;
    password: string;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Handle form submission here
    console.log({ firstName, lastName, password } as FormData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center gap-2 w-full"
    >
      <div className="relative flex flex-col items-center gap-2">
        <label
          htmlFor="avatar-upload"
          className="block cursor-pointer"
          title="Click to upload avatar"
        >
          <div className="bg-gray-100 rounded-full p-2 hover:bg-gray-50 active:bg-gray-200 transition-all duration-200">
            <img
              src={avatarImage}
              alt="Click to upload avatar"
              className="w-12 h-12 rounded-full hover:opacity-80"
              style={{ opacity: avatarImage === avatar ? 0.1 : 1 }}
            />
          </div>
        </label>
        <label
          htmlFor="avatar-upload"
          className="p-1 px-2 hover:bg-gray-100 rounded-lg active:bg-gray-200 cursor-pointer"
        >
          Upload
        </label>
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      <div className="flex flex-col items-center justify-center gap-4 w-full">
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

      <button
        type="submit"
        className="mt-4 bg-[#0077D4] text-white p-2 rounded-lg hover:bg-blue-500 active:bg-[#005FA3] text-[14px] font-semibold max-w-[300px] w-full"
      >
        Continue
      </button>
    </form>
  );
};

export default SignUpForm;
