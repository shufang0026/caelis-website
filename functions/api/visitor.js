export async function onRequestDelete(context) {
  const WORKER_URL = 'https://caelis-subscribe-production.shufang0026.workers.dev';
  
  const authHeader = context.request.headers.get('Authorization') || '';
  const url = new URL(context.request.url);
  const email = url.searchParams.get('email');
  
  const response = await fetch(`${WORKER_URL}/visitor?email=${encodeURIComponent(email)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': authHeader,
    },
  });
  
  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
