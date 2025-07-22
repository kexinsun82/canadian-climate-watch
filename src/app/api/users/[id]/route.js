import { users } from '@clerk/clerk-sdk-node';
import { currentUser } from '@clerk/nextjs/server';

const getUserRoleFromUser = (user) => {
  if (!user) return 'visitor';

  let roles = user.publicMetadata?.roles;
  if (roles) {
    if (typeof roles === 'string') {
      try {
        const parsed = JSON.parse(roles);
        if (Array.isArray(parsed)) roles = parsed;
        else roles = [roles];
      } catch {
        roles = [roles];
      }
    }
    if (Array.isArray(roles) && roles.includes('admin')) return 'admin';
    if (Array.isArray(roles) && roles.includes('member')) return 'member';
  }

  const role = user.publicMetadata?.role;
  if (role === 'admin') return 'admin';
  if (role === 'member') return 'member';

  return 'visitor';
};

export async function DELETE(request, { params }) {
  const { id } = await params;
  
  try {
    const currentUserData = await currentUser();
    if (!currentUserData) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userRole = getUserRoleFromUser(currentUserData);
    
    if (userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Only admins can delete users' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await users.deleteUser(id);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  
  try {
    const currentUserData = await currentUser();
    if (!currentUserData) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userRole = getUserRoleFromUser(currentUserData);
    
    if (userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Only admins can update user roles' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { role } = body;
    
    await users.updateUser(id, {
      publicMetadata: { role }
    });
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to update user role:', error);
    return new Response(JSON.stringify({ error: 'Failed to update user role' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  try {
    const result = await users.getUserList();
    const users = result.data; 

    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      primaryEmailAddress: user.emailAddresses.find(email => email.id === user.primaryEmailAddressId),
      role: getUserRoleFromUser(user),
      createdAt: user.createdAt
    }));

    return new Response(JSON.stringify(formattedUsers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch users', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}