import axios from 'axios';

export async function GET() {
  try {
    const response = await axios.get(
      'https://dd.weather.gc.ca/observations/xml/ON/today/today_on_20250704_e.xml'
    );
    const xml = response.data;
    return new Response(xml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' }
    });
  } catch (error) {
    console.error('Error fetching observations:', error);
    return new Response('Failed to fetch observations', { status: 500 });
  }
}