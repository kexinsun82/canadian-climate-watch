import Report from '../../../../models/Report';
import dbConnect from '../../../../lib/dbConnect';
import { currentUser } from '@clerk/nextjs/server';

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = await params;
  
  try {
    const user = await currentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return new Response(JSON.stringify({ error: 'Report not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const role = user.publicMetadata?.role;
    const isAdmin = role === 'admin';

    if (!isAdmin && report.userId !== user.id) {
      return new Response(JSON.stringify({ error: 'You can only delete your own reports' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await Report.findByIdAndDelete(id);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to delete report:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete report' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}