import { currentUser } from '@clerk/nextjs';

export const getUserRole = async () => {
  try {
    const user = await currentUser();
    if (!user) return 'visitor';
    
    const roles = user.publicMetadata?.roles || [];
    
    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (userRoles.includes('admin')) return 'admin';
    
    if (userRoles.includes('member')) return 'member';
    
    return 'visitor';
  } catch (error) {
    console.error('Get user role failed:', error);
    return 'visitor';
  }
};

export const isAdmin = async () => {
  const role = await getUserRole();
  return role === 'admin';
};

export const isMember = async () => {
  const role = await getUserRole();
  return role === 'member' || role === 'admin';
};