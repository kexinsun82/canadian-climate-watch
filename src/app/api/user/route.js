import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { data, type } = body;
    if (type !== 'user.created') {
      return Response.json({ success: false, message: 'Unsupported event type' }, { status: 400 });
    }
    const { id: clerkId, email_addresses, first_name, last_name, image_url } = data;
    const email = email_addresses?.[0]?.email_address || '';

    const client = await connectToDatabase();
    const db = client.db(process.env.DB_NAME);
    const exist = await db.collection('users').findOne({ clerkId });
    if (exist) {
      return Response.json({ success: true, message: 'User already exists' });
    }
    const userDoc = {
      clerkId,
      email,
      firstName: first_name || '',
      lastName: last_name || '',
      avatar: image_url || '',
      createdAt: new Date(),
    };
    await db.collection('users').insertOne(userDoc);
    return Response.json({ success: true });
  } catch (error) {
    console.error('User sync failed:', error);
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const { userId } = auth();
  if (!userId) return Response.json({ success: false, message: 'Please register' }, { status: 401 });
  const user = await currentUser();
  const roles = user?.publicMetadata?.roles || [];
  if (!roles.includes('admin')) {
    return Response.json({ success: false, message: 'No permission' }, { status: 403 });
  }
} 