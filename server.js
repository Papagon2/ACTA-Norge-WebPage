const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

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

const app = express();

// Serve static files and .well-known folder
app.use(express.static(__dirname));
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));

// ====== MEMBERS PROXY ======
app.use('/Members', (req, res, next) => {
    console.log(`Proxying Members → http://127.0.0.1:8080${req.url}`);
    next();
});
app.use('/Members', createProxyMiddleware({
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
    pathRewrite: (path, req) => `/Members${req.url}`,
}));

// ====== FORUM PROXY ======
app.use('/Forum', (req, res, next) => {
    console.log(`Proxying Forum → http://127.0.0.1:8080${req.url}`);
    next();
});
app.use('/Forum', createProxyMiddleware({
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
    pathRewrite: (path, req) => `/Forum${req.url}`,
}));

// Default route for your homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// SEO files
app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'robots.txt'));
});

// HTTPS SERVER
if (options.key && options.cert) {
    https.createServer(options, app).listen(PORT_HTTPS, '0.0.0.0', () => {
        console.log(`✅ HTTPS server running at https://ACTA-Norge.ddns.net`);
    });
} else {
    console.log("⚠️ HTTPS server not running yet. Waiting for SSL certificate.");
}

// HTTP → HTTPS Redirect
const redirectApp = express();
redirectApp.use((req, res) => {
    const redirectUrl = `https://${req.headers.host}${req.url}`;
    res.redirect(301, redirectUrl);
});
http.createServer(redirectApp).listen(PORT_HTTP, '0.0.0.0', () => {
    console.log(`🔄 HTTP redirect server running at http://ACTA-Norge.ddns.net → HTTPS`);
});
