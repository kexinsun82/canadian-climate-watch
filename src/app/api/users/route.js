import { users } from '@clerk/clerk-sdk-node';

export async function GET() {
  try {
    const userList = await users.getUserList();
    
    const formattedUsers = userList.map(user => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      primaryEmailAddress: user.emailAddresses?.find(email => email.id === user.primaryEmailAddressId),
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