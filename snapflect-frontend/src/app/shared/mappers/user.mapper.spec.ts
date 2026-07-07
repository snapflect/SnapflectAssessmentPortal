import { UserMapper } from './user.mapper';
import { AuthenticatedUserModel } from '../models/auth.models';

describe('UserMapper', () => {
  it('should map AuthenticatedUserModel to UserProfile correctly', () => {
    const apiUser: any = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      roles: ['admin'],
      permissions: ['read', 'write'],
      organization_id: 42,
      organization_name: 'Acme Corp'
    };

    const result = UserMapper.toUserProfile(apiUser as AuthenticatedUserModel);

    expect(result).toEqual({
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      roles: ['admin'],
      permissions: ['read', 'write'],
      tenantId: '42',
      organization_name: 'Acme Corp'
    });
  });

  it('should handle missing organization_id', () => {
    const apiUser: any = {
      id: 2,
      email: 'jane@example.com',
      roles: [],
      permissions: []
    };

    const result = UserMapper.toUserProfile(apiUser as AuthenticatedUserModel);
    expect(result.tenantId).toBe('');
  });
});
