const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/home/raphael/.cache/puppeteer/chrome-headless-shell/linux-144.0.7559.96/chrome-headless-shell-linux64/chrome-headless-shell',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'] // crucial for root/docker & self-signed certs
  });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating...');
    await page.goto('https://192.168.100.1', { waitUntil: 'networkidle2' });
    
    console.log('Page loaded. Title:', await page.title());
    
    // Dump HTML to see IDs
    const content = await page.content();
    console.log('HTML length:', content.length);
    
    // Save screenshot
    await page.screenshot({ path: 'router_login.png' });
    console.log('Screenshot saved.');
    
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();