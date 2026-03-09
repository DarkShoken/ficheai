const https = require('https');

function httpsPost(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  console.log('Function called, method:', event.httpMethod);

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const parsed = JSON.parse(event.body);
    console.log('Prompt received, length:', parsed.prompt?.length);
    console.log('API key present:', !!process.env.ANTHROPIC_API_KEY);
    console.log('API key starts with:', process.env.ANTHROPIC_API_KEY?.substring(0, 10));

    const payload = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: parsed.prompt }]
    });

    console.log('Calling Anthropic API...');

    const result = await httpsPost({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, payload);

    console.log('API status:', result.status);
    console.log('API response preview:', result.body.substring(0, 200));

    const data = JSON.parse(result.body);
    const text = (data.content || []).map(b => b.text || '').join('');
    console.log('Text length:', text.length);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    };
  } catch (err) {
    console.log('ERROR:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
