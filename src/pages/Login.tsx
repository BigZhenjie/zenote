import LoginHeader from "../components/auth/LoginHeader";
import OAuthGroup from "../components/auth/OAuthGroup";
import AuthForm from "../components/auth/AuthForm";
const Login = () => {
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
