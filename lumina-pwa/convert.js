const sharp = require('sharp');
const fs = require('fs');

const svgBuffer = fs.readFileSync('icon.svg');

async function convert() {
    await sharp(svgBuffer)
        .resize(512, 512)
        .png()
        .toFile('icon-512.png');
    console.log('icon-512.png created');
    
    await sharp(svgBuffer)
        .resize(192, 192)
        .png()
        .toFile('icon-192.png');
    console.log('icon-192.png created');
    
    await sharp(svgBuffer)
        .resize(180, 180)
        .png()
        .toFile('apple-touch-icon.png');
    console.log('apple-touch-icon.png created');
}

convert();
