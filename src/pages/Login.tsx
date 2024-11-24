import LoginHeader from "../components/login/LoginHeader";
import OAuthGroup from "../components/login/OAuthGroup";

const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <LoginHeader />
      <OAuthGroup />
    </div>
  );
};

export default Login;
