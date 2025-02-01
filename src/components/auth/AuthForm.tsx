import { useRef, useState } from "react";
import { CircleX } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Response} from "../../types";
import { StatusCode } from "../../constants/statusCode";

const AuthForm = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setEmail("");
    inputRef.current?.focus();
  };

  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (email && password) {
      try {
        console.log("Logging in...");
        const { status, data, error: loginError } = await login(email, password);
        
        if (loginError) {
          throw { status, error: loginError };
        }

        console.log("Logged in successfully", data);
        navigate("/home");
      } catch (error: any) {
        console.log("Error logging in:", error);
        if (error.status === StatusCode.NotFound) { // User not found
          setShowCreateAccount(true);
          setShowPasswordField(false);
        } else if (error.status === StatusCode.Unauthorized) { // Invalid password
          setError("Invalid password");
        } else {
          setError(error.error || "An error occurred during login");
        }
      } finally {
        setLoading(false);
      }
    } else {
      handleEmailSubmit(e);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!email) {
      setLoading(false);
      return;
    }

    try {
      const response = await invoke<Response<boolean>>(
        "check_if_email_exists",
        { email }
      );

      if (!response.data) {
        setShowCreateAccount(true);
        return;
      }

      setShowPasswordField(true);
      setError("")
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Failed to check email existence");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email && password) {
      handleFinalSubmit(e);
    } else {
      handleEmailSubmit(e);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
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
        {showPasswordField && (
          <>
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password..."
              className="border border-gray-200 rounded-lg p-2 w-full"
            />
          </>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
        <p className="text-xs text-gray-500">
          Use an organization email to easily collaborate with teammates
        </p>
      </div>

      {showCreateAccount && (
        <p className="text-xs text-gray-500">
          It seems like this email is not associated with any account.{" "}
          <span
            className="cursor-pointer text-blue-400"
            onClick={() => navigate(`/onboarding/${email}`)}
          >
            Create an account
          </span>{" "}
          to continue.
        </p>
      )}
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 py-3 font-semibold disabled:bg-blue-300"
        disabled={loading || authLoading}
      >
        Continue
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your name and photo are displayed to users who invite you to a workspace
        using your email. By continuing, you acknowledge that you understand and
        agree to the <span className="underline">Terms of Service</span> and{" "}
        <span className="underline">Privacy Policy</span>.
      </p>
    </form>
  );
};

export default AuthForm;
