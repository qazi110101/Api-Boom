export default {
  async fetch(request, env) {
    // 1. CORS Header (Taaki browser block na kare)
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Content-Type': 'application/json',
    };

    // Agar request OPTIONS hai (Browser check ke liye), toh wapas jao
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Sirf POST requests allow karo
    if (request.method !== 'POST') {
      return new Response('Only POST allowed', { status: 405, headers });
    }

    try {
      // Data nikalo jo frontend se aa raha hai
      const { to, message } = await request.json();

      // Twilio API URL
      const url = `https://api.twilio.com/2010-04-01/Accounts/${env.ACCOUNT_SID}/Messages.json`;
      
      // Authorization String banayein (Base64 encoding)
      const authString = btoa(`${env.ACCOUNT_SID}:${env.AUTH_TOKEN}`);

      // Twilio ko request bhejo
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `To=${to}&From=${env.FROM_NUMBER}&Body=${message}`
      });

      const data = await response.json();
      
      // Response wapas bhejo frontend ko
      return new Response(JSON.stringify(data), { headers });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
  }
};
