import { StatusCode } from "../constants/statusCode";
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { LucideProps } from 'lucide-react'; // Adjust this import based on your actual icon library
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

declare type User = {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  createdAt: string;
  id: string;
  token: string;
};


//------------------------------------------------Sidebar------------------------------------------

declare type SidebarHeaderProps = {
  firstName: string | undefined;
};

declare type SidebarItemProps = {
  title: string;
  Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  path?: string;
  isActive: boolean;
};


//------------------------------------------------Pages------------------------------------------
declare type PageProps = {
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  id: string;
  parentPageId: string | null;
  profilePicUrl: string;
};