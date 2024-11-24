import { oauthProviders } from '../../constants/login'
import OAuthButton from './OAuthButton'

const OAuthGroup = () => {
  return (
    <div className="flex flex-col gap-2">
        {oauthProviders.map((provider: OAuthProvider) => (
          <OAuthButton
            key={provider.text}
            image={provider.image}
            text={provider.text}
          />
      ))}
    </div>
  );
};

export default OAuthGroup
