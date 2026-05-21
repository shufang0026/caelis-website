export async function onRequestGet(context) {
  const WORKER_URL = 'https://caelis-subscribe-production.shufang0026.workers.dev';
  
  const authHeader = context.request.headers.get('Authorization') || '';
  
  const response = await fetch(`${WORKER_URL}/newsletter`, {
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
