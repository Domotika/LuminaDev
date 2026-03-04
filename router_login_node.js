process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const https = require('https');

// Ignore self-signed certs
const agent = new https.Agent({
  rejectUnauthorized: false
});

const URL = "https://192.168.100.1";
const USER = "admin";
const PASS = "Da155201##";

async function run() {
  try {
    // 1. Get Token
    const tokenResp = await fetch(`${URL}/asp/GetRandCount.asp`, {
      method: 'POST',
      agent
    });
    const token = await tokenResp.text();
    console.log('Token:', token.trim());

    // 2. Prepare Login
    const passB64 = Buffer.from(PASS).toString('base64');
    const params = new URLSearchParams();
    params.append('UserName', USER);
    params.append('PassWord', passB64);
    params.append('Language', 'english');
    params.append('x.X_HW_Token', token.trim());

    // The cookie logic from safelogin.js:
    // Cookie=body:Language:english:id=-1;path=/
    // In headers, we send "Cookie: key=value"
    // So: "Cookie: Cookie=body:Language:english:id=-1"
    const cookieHeader = 'Cookie=body:Language:english:id=-1';

    // 3. Login
    const loginResp = await fetch(`${URL}/login.cgi`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params,
      redirect: 'manual', // Don't follow yet
      agent
    });

    console.log('Login Status:', loginResp.status);
    const setCookie = loginResp.headers.get('set-cookie');
    console.log('Set-Cookie:', setCookie);

    const nextCookie = setCookie ? setCookie.split(';')[0] : cookieHeader;
    console.log('Next Cookie:', nextCookie);
    
    // Try to access Parental Control with better headers
    const parentalUrl = `${URL}/html/bbsp/parentalctrl/parentalctrlstatus.asp`;
    const parentalResp = await fetch(parentalUrl, {
      headers: {
        'Cookie': nextCookie,
        'Referer': `${URL}/html/content.asp`, // Try referring from content frame
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      },
      agent
    });
    const parentalText = await parentalResp.text();
    console.log('Parental Status:', parentalResp.status);
    
    // Write to file to inspect
    const fs = require('fs');
    fs.writeFileSync('parental_dump.html', parentalText);
    console.log('Dumped parental page to parental_dump.html');



  } catch (e) {
    console.error(e);
  }
}

run();