import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginHeader from "../components/auth/LoginHeader";
import OAuthGroup from "../components/auth/OAuthGroup";
import AuthForm from "../components/auth/AuthForm";
import { isTokenExpired } from "../lib/jwt";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (token && !isTokenExpired(token)) {
      navigate('/home');
    }
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-[350px]">
        <LoginHeader />
        <OAuthGroup />
        <hr className="my-6" />
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;
