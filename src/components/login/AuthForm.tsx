import { useRef, useState } from "react";
import { CircleX } from "lucide-react";
const AuthForm = () => {
  const [email, setEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setEmail("");
    inputRef.current?.focus();
  };
  return (
    <form className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            className="border border-gray-200 rounded-lg p-2 w-full"
            autoComplete="off"
          />
          {email && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <CircleX size={18} />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Use an organization email to easily collaborate with teammates
        </p>
      </div>

      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 py-3 font-semibold"
      >
        Continue
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your name and photo are displayed to users who invite you to a workspace
        using your email. By continuing, you acknowledge that you understand and
        agree to the <span className="underline">Terms of Service</span> and
        {" "}
        <span className="underline">Privacy Policy</span>.
      </p>
    </form>
  );
};

export default AuthForm;
