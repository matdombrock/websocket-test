const { parseArgs } = require('util');
const WebSocket = require('ws');

// Create a new WebSocket server
const wss = new WebSocket.Server({ port: 9090 });

// Thoughput test options
let tOpts = {
    run: false,
    size: 16,
    delay: 1000 / 60
};

// When a connection is established
wss.on('connection', (ws) => {
    console.log('New client connected');
    // Disable throughput test
    tOpts.run = false;
    // When a message is received from the client
    ws.on('message', (message) => {
        const msg = message.toString();
        // If the message is 'ping', respond with 'pong'
        if (msg === 'ping') {
            //console.log('SENT PONG');
            ws.send('pong');
        }
        if (msg.includes('topts')) {
            if (msg === 'topts_stop') {
                tOpts.run = false;
                return;
            }
            console.log('topts');
            const split = msg.split('_');
            console.log(split);
            tOpts.run = true;//parseInt(split[1]);
            tOpts.size = parseInt(split[1]);
            tOpts.delay = parseInt(split[2]);
        }
    });

    function F(timeout) {
            if (tOpts.run) {
            let sines = [];
            const now = Date.now();
            for (let i = 0; i < tOpts.size; i++) {
                const div = 100 * (i + 1);
                sines.push(Math.sin(now / div))
            }
            ws.send('sine_' + sines.join('_'));
            ws.send('date_' + now);
        }
        setTimeout(()=>{
            F(tOpts.delay);
        }, timeout);
    }
    F(tOpts.delay);
    

    // When the connection is closed
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});