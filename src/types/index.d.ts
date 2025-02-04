import { StatusCode } from "../constants/statusCode";
//------------------------------------------------RESPONSE------------------------------------------
export type Response<T = any> = {
  status: StatusCode;
  data?: T;
  error?: string;
};
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


//------------------------------------------------Sidebar------------------------------------------

declare type SidebarHeaderProps = {
  avatarUrl: string | undefined;
  firstName: string | undefined;
};