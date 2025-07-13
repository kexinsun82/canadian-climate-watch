import Report from '../../../models/Report';
import dbConnect from '../../../lib/dbConnect';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  await dbConnect();
  
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    return new Response(JSON.stringify(reports), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch reports' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  await dbConnect();
  
  try {
    const user = await currentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const report = new Report({
      userId: user.id,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
      userEmail: user.emailAddresses[0]?.emailAddress || '',
      label: body.label,
      customLabel: body.customLabel,
      level: body.level,
      notes: body.notes,
      location: {
        type: 'Point',
        coordinates: [body.lng, body.lat]
      }
    });

    await report.save();
    
    return new Response(JSON.stringify({ success: true, report }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to create report:', error);
    return new Response(JSON.stringify({ error: 'Failed to create report' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}