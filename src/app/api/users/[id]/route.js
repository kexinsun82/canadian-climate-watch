import { users } from '@clerk/clerk-sdk-node';
import { currentUser } from '@clerk/nextjs/server';

export async function DELETE(request, { params }) {
  const { id } = params;
  
  try {
    const currentUserData = await currentUser();
    if (!currentUserData) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const roles = currentUserData.publicMetadata?.roles || [];
    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes('admin')) {
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
  const { id } = params;
  
  try {
    const currentUserData = await currentUser();
    if (!currentUserData) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const roles = currentUserData.publicMetadata?.roles || [];
    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes('admin')) {
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
      role: user.publicMetadata?.role || 'member',
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