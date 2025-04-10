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
  }
  