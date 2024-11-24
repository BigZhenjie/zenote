import LoginHeader from "../components/login/LoginHeader";
import OAuthButton from "../components/login/OAuthButton";
import { oauthProviders } from "../constants/login.ts";

const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <LoginHeader />
      <div className="flex flex-col gap-2">
        {oauthProviders.map((provider: OAuthProvider) => (
          <OAuthButton
            key={provider.text}
            image={provider.image}
            text={provider.text}
          />
        ))}
      </div>
    </div>
  );
};

export default Login;
