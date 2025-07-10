import { clerkClient } from '@clerk/nextjs';

export async function GET() {
  try {
    const users = await clerkClient.users.getUserList();
    
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
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}