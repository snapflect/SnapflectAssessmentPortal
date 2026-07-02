import { AuthenticatedUserModel } from '../models/auth.models';
import { UserProfile } from '../stores/user.store';

export class UserMapper {
  static toUserProfile(apiUser: AuthenticatedUserModel): UserProfile {
    return {
      id: apiUser.id,
      first_name: (apiUser as any).first_name,
      last_name: (apiUser as any).last_name,
      email: apiUser.email,
      roles: apiUser.roles,
      permissions: apiUser.permissions,
      tenantId: apiUser.organization_id ? apiUser.organization_id.toString() : '',
      organization_name: (apiUser as any).organization_name
    };
  }
}