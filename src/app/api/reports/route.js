import Report from '../../../models/Report';
import dbConnect from '../../../lib/dbConnect';

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