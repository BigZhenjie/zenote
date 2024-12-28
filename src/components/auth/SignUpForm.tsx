import avatar from "/auth/avatar.png";
import CustomInput from "./CustomInput";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";


const SignUpForm = () => {
  const { email } = useParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [avatarImage, setAvatarImage] = useState<string>(avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
  
      // Clean up previous URL if exists
      if (avatarImage !== avatar) {
        URL.revokeObjectURL(avatarImage);
      }
  
      // Store file for upload
      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let avatarUrl = "https://gzliirrtmmdeumryfouh.supabase.co/storage/v1/object/public/avatars/default.png";

      if (avatarFile) {
        const arrayBuffer = await avatarFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        const filePath = await invoke("save_temp_file", {
          fileBytes: Array.from(bytes),
        });

        const response: {response: string, success: boolean} = await invoke("upload_file", {
          bucket: "avatars",
          path: `${avatarFile.name}`,
          filePath,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          supabaseKey: import.meta.env.VITE_SUPABASE_AUTH_TOKEN,
        });
        const avatarPath: string = JSON.parse(response.response).Key;
        avatarUrl = "https://gzliirrtmmdeumryfouh.supabase.co/storage/v1/object/public/" + avatarPath;
      }

      const sign_up_response = await invoke("sign_up", {
        email,
        password,
        firstName,
        lastName,
        avatarUrl
      });
      
      console.log("Sign up response:", sign_up_response);
    } catch (error) {
      console.error("Sign up failed:", error);
    } finally {
      setLoading(false);
    }
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
              className="w-12 h-12 rounded-full hover:opacity-80 object-cover"
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
        className="mt-4 bg-[#0077D4] text-white p-2 rounded-lg hover:bg-blue-500 active:bg-[#005FA3] text-[14px] font-semibold max-w-[300px] w-full disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        Continue
      </button>
    </form>
  );
};

export default SignUpForm;
