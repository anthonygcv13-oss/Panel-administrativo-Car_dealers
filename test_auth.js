const http = require('http');

const API_URL = 'http://localhost:3000/api';

function makeRequest(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : '';
    if (body) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: method,
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(payload);
    }
    req.end();
  });
}

async function run() {
  try {
    console.log('Logging in as anthonygcv1@gmail.com...');
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'anthonygcv1@gmail.com',
      password: 'Ac30921446'
    });

    console.log('Login status:', loginRes.statusCode);
    if (loginRes.statusCode !== 200 || !loginRes.data.success) {
      console.log('Login failed:', loginRes.data);
      return;
    }

    const token = loginRes.data.user.token;
    console.log('Token obtained successfully.');

    const endpoints = [
      '/roles',
      '/users',
      '/brands',
      '/models',
      '/suppliers',
      '/vehicles',
      '/customers',
      '/financing-plans',
      '/vehicle-sale',
      '/payments',
      '/quotes',
      '/vehicle-images',
      '/notifications'
    ];

    for (const endpoint of endpoints) {
      console.log(`Fetching ${endpoint}...`);
      const res = await makeRequest(`/api${endpoint}`, 'GET', null, token);
      console.log(`Response for ${endpoint}:`, res.statusCode);
      if (res.data) {
        console.log(`Success: ${res.data.success}, Data count: ${res.data.data ? res.data.data.length : 'none'}`);
        if (res.data.data && res.data.data.length > 0) {
          console.log('Sample data item:', JSON.stringify(res.data.data[0], null, 2));
        }
      } else {
        console.log('Raw response:', res.raw);
      }
      console.log('--------------------------------------------------');
    }

  } catch (error) {
    console.error('Error running test:', error);
  }
}

run();
