import LoginHeader from "../components/login/LoginHeader";
import OAuthGroup from "../components/login/OAuthGroup";
import AuthForm from "../components/login/AuthForm";
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
