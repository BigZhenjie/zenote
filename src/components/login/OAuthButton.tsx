const OAuthButton = ({ image, text }: OAuthButtonProps) => {
  return (
    <button className="  border border-gray-200 rounded-lg py-2 px-20 flex items-center justify-center gap-2">
      <img src={image} alt={text} className="w-4 h-4" />
      <span className="font-medium text-sm">{text}</span>
    </button>
  );
};

export default OAuthButton;
