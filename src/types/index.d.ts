//------------------------------------------------AUTH------------------------------------------
declare type OAuthButtonProps = {
  image: string;
  text: string;
};

declare type OAuthProvider = {
  image: string;
  text: string;
};

declare type CustomInputProps = {
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};