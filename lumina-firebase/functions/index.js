const functions = require('firebase-functions');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Proxy para Hubitat Cloud API
exports.hubitat = functions.https.onRequest(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders);
    res.status(204).send('');
    return;
  }

  // Set CORS headers for all responses
  res.set(corsHeaders);

  try {
    const { uuid, path, token } = req.query;
    
    console.log('Request params:', { uuid: uuid?.substring(0, 8) + '...', path, hasToken: !!token });
    
    if (!uuid || !path || !token) {
      res.status(400).json({ 
        error: 'Missing parameters', 
        required: 'uuid, path, token',
        received: { uuid: !!uuid, path: !!path, token: !!token }
      });
      return;
    }

    // Build Hubitat Cloud URL
    const hubitatUrl = `https://cloud.hubitat.com/api/${uuid}/${path}?access_token=${token}`;
    console.log('Proxying to:', hubitatUrl.replace(token, 'TOKEN_HIDDEN'));
    
    // Forward request to Hubitat
    const hubitatRes = await fetch(hubitatUrl, {
      method: req.method,
      headers: {
        'Accept': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Get response as text first
    const responseText = await hubitatRes.text();
    console.log('Hubitat response status:', hubitatRes.status);
    console.log('Hubitat response preview:', responseText.substring(0, 200));
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      res.status(hubitatRes.status).json(data);
    } catch (parseError) {
      // Not JSON - might be error or HTML
      if (responseText.includes('<oauth>') || responseText.includes('error')) {
        res.status(401).json({ 
          error: 'Hubitat authentication failed',
          details: 'Check UUID and Token',
          raw: responseText.substring(0, 500)
        });
      } else {
        res.status(hubitatRes.status).send(responseText);
      }
    }
    
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message 
    });
  }
});
