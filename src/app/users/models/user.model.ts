export interface User {
    id?: number;
    name: string;
    email: string;
    username: string;
    password?: string;
    confirmPassword?: string;
    role: string;
    designation: string;
    avatar: string;
    created?: string;
    is_admin: boolean;
  }
  
  export interface CurrentUser {
    id?: number;
    name: string;
    email: string;
    username: string;
    role: string;
    designation: string;
    avatar: string;
    permissions: string[];
  }
  