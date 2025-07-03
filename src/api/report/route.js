import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { auth } from '@clerk/nextjs/server';

function isValidObjectId(id) {
  return ObjectId.isValid(id) && (String)(new ObjectId(id)) === id;
}

export async function POST(request) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return Response.json({ success: false, message: 'Please register' }, { status: 401 });
    }

    const client = await connectToDatabase();
    const db = client.db(process.env.DB_NAME);

    const mongoUser = await db.collection('users').findOne({ clerkId });
    if (!mongoUser) {
      return Response.json({ success: false, message: 'Please register' }, { status: 401 });
    }

    const body = await request.json();
    const report = {
      ...body,
      userId: mongoUser._id,
      status: 'Pending',
      createdAt: new Date(),
    };

    const result = await db.collection('reports').insertOne(report);
    return Response.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Report submission failed:', error);
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const client = await connectToDatabase();
    const db = client.db(process.env.DB_NAME);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'Approved';
    const userId = searchParams.get('userId');

    const query = { status };
    if (userId) {
      if (!isValidObjectId(userId)) {
        return Response.json({ success: false, message: 'Invalid user ID' }, { status: 400 });
      }
      query.userId = new ObjectId(userId);
    }

    const reports = await db
      .collection('reports')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json(reports);
  } catch (error) {
    console.error('Get reports failed:', error);
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}