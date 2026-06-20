import { AuthenticatedUserModel } from '../models/auth.models';
import { UserProfile } from '../stores/user.store';

export class UserMapper {
  static toUserProfile(apiUser: AuthenticatedUserModel): UserProfile {
    return {
      id: apiUser.id,
      email: apiUser.email,
      roles: apiUser.roles,
      permissions: apiUser.permissions,
      tenantId: apiUser.organization_id.toString()
    };
  }
}