const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT_HTTP = 80;
const PORT_HTTPS = 443;

let options = {};

try {
    options = {
        key: fs.readFileSync('private.key', 'utf8'),
        cert: fs.readFileSync('certificate.crt', 'utf8'),
        ca: fs.readFileSync('ca_bundle.crt', 'utf8')
    };
} catch (err) {
    console.warn("⚠️ SSL files not found yet.");
}

// ====== HTTPS SERVER ======
const app = express();

// Serve static files and .well-known folder
app.use(express.static(__dirname));
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));

// Default route for your website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start HTTPS server (port 443)
if (options.key && options.cert) {
    https.createServer(options, app).listen(PORT_HTTPS, '0.0.0.0', () => {
        console.log(`✅ HTTPS server running at https://ACTA-Norge.ddns.net`);
    });
} else {
    console.log("⚠️ HTTPS server not running yet. Waiting for SSL certificate.");
}

// ====== HTTP SERVER FOR REDIRECT ======
const redirectApp = express();

// Redirect ALL HTTP requests to HTTPS
redirectApp.use((req, res) => {
    const redirectUrl = `https://${req.headers.host}${req.url}`;
    res.redirect(301, redirectUrl);
});

// Start HTTP redirect server (port 80)
http.createServer(redirectApp).listen(PORT_HTTP, '0.0.0.0', () => {
    console.log(`🔄 HTTP redirect server running at http://ACTA-Norge.ddns.net → HTTPS`);
});
