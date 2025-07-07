import axios from 'axios';


export async function GET() {
 try {

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); 
  const day = String(today.getDate()).padStart(2, '0');
  const dateString = `${year}${month}${day}`;

  // const response = await axios.get(
  //   'https://dd.weather.gc.ca/observations/xml/ON/today/today_on_20250707_e.xml'
  // );
  const url = `https://dd.weather.gc.ca/observations/xml/ON/today/today_on_${dateString}_e.xml`;

  const response = await axios.get(url);
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
