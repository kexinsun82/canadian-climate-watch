import Report from '../../../../models/Report';
import dbConnect from '../../../../lib/dbConnect';

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = params;
  
  try {
    await Report.findByIdAndDelete(id);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete report' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}