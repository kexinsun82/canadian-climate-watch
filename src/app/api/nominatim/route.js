export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  if (!lat || !lon) {
    return Response.json({ error: 'Missing lat/lon' }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ClimaTrackCanada/1.0 (kexin.sun82@gmail.com)'
      }
    });
    if (!res.ok) {
      return Response.json({ error: 'Nominatim error' }, { status: 502 });
    }
    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: 'Fetch failed' }, { status: 500 });
  }
}