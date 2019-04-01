const net = require('net');

const flag = '\r\n\r\n';

const retry_max = 30;

const iploc = {};

const cache = {};
let off = 0;
let online = 0;

const idpool = (function () {
    this.p = {};
    return () => {
        let t = Date.now();
        if (this.p.t !== t) {
            this.p.t = t;
            this.p.o = 0;
        }
        return t + ('00000' + (++this.p.o)).substr(-6);
    };
})();

function init (port, host) {
    iploc.init = true;
    const client = net.createConnection(port, host);
    client.setEncoding('utf8');
    client.on('connect', () => {
        off = 0;
        online = 1;
        console.log('connected', (new Date()).toString());
    });
    let data = '';
    client.on('data', buffer => {
        data += buffer;
        data = checkPacket(data);
    });
    client.on('close', () => { //retry forever
        console.log('disconnected', (new Date()).toString());
        off = retry_max;
        online = 0;
        setTimeout(() => client.connect(port, host), 3000);
    });
    client.on('error', err => {
        console.error('err', (new Date()).toString(), err);
    });
    function ping () {
        if (++off > retry_max) {
            client.destroyed || client.destroy();
        } else {
            client.write('ping' + flag);
        }
        setTimeout(ping, 10000);
    }
    setTimeout(ping, 5000);
    iploc.search = function (ip) {
        return new Promise((resolve, reject) => {
            if (online) {
                let id = idpool();
                cache[id] = resolve;
                let msg = JSON.stringify({
                    'x-auth': 4,
                    'ip': ip,
                    'id': id
                });
                client.write(msg + flag);
                setTimeout(() => {
                    if (cache[id]) {
                        delete cache[id];
                        reject('timeout');
                    }
                }, 3000);
            } else {
                reject('offline');
            }
        });
    };
}
function checkPacket (data) {
    const packets = data.split(flag);
    while (packets.length > 1) {
        handlePacket(packets.shift());
    }
    return packets[0];
}
function handlePacket (packet) {
    if (packet == 'pong') {
        off = 0;
        return;
    }
    try {
        let { id, loc } = JSON.parse(packet);
        if (id && cache[id]) {
            cache[id](loc);
            delete cache[id];
        }
    } catch (err) {
        console.error(err);
        if (!client._err) {
            client._err = 0;
        }
        if (++client._err > 100) {
            client.destroy();
        }
    }
}

module.exports = function (port, host) {
    if (!iploc.init) {
        port = port || 6000;
        host = host || 'localhost';
        init(port, host);
    }
    return iploc;
};
