const http = require('http');

const server = http.createServer((req, res) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    
    res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ 
        status: 'success', 
        message: 'Server is working!',
        timestamp: new Date().toISOString()
    }));
});

const PORT = 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`✅ Simple HTTP server listening on http://0.0.0.0:${PORT}`);
    console.log(`Test it: http://localhost:${PORT}/test or http://127.0.0.1:${PORT}/test`);
});

server.on('error', (error) => {
    console.error('❌ Server error:', error);
});

server.on('listening', () => {
    console.log('✅ Server is actively listening for connections');
});
