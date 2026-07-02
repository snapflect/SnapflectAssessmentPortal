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