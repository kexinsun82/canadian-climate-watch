import { clerkClient } from '@clerk/nextjs';

export async function DELETE(request, { params }) {
  const { id } = params;
  
  try {
    await clerkClient.users.deleteUser(id);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PATCH(request, { params }) {
  const { id } = params;
  
  try {
    const body = await request.json();
    const { role } = body;
    
    await clerkClient.users.updateUser(id, {
      publicMetadata: { role }
    });
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update user role' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}