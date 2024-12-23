import avatar from "/auth/avatar.png";
import CustomInput from "./CustomInput";
import { useState } from "react"

const SignUpForm = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");

    interface FormData {
        firstName: string;
        lastName: string;
        password: string;
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        // Handle form submission here
        console.log({ firstName, lastName, password } as FormData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-2 w-full">
            <button type="button" className="bg-gray-100 rounded-full p-2 hover:bg-gray-50 active:bg-gray-200">
                <img
                    src={avatar}
                    alt="avatar"
                    className="w-12 h-12 rounded-full opacity-10"
                />
            </button>

            <button type="button" className="p-1 px-2 hover:bg-gray-100 rounded-lg active:bg-gray-200">Upload</button>

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
            
            <button type="submit" className="mt-4 bg-[#0077D4] text-white p-2 rounded-lg hover:bg-blue-500 active:bg-[#005FA3] text-[14px] font-semibold max-w-[300px] w-full">
                Continue
            </button>
        </form>
    );
};

export default SignUpForm;
