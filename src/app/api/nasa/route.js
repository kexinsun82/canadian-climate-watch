export async function GET() {
  try {
    const res = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events');
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch NASA EONET' }), { status: 500 });
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'NASA EONET fetch error' }), { status: 500 });
  }
} 