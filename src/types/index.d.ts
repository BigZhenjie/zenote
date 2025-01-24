//------------------------------------------------RESPONSE------------------------------------------
export enum StatusCode {
  Ok = 200,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  InternalServerError = 500,
}

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
