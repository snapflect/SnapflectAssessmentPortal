export interface LoginRequestModel {
  email: string;
  password: string;
}

export interface LoginResponseModel {
  access_token: string;
  user: AuthenticatedUserModel;
}

export interface AuthenticatedUserModel {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  organization_id: number;
  organization_name?: string | null;
  roles: string[];
  permissions: string[];
}

export interface ChangePasswordModel {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ClaimAccountRequestModel {
  email: string;
  token: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordRequestModel {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}