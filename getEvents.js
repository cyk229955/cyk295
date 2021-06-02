/* eslint-disable */
const io = require('socket.io-client');
const process = require('process');

let url = 'https://api.mistx.io';
let serializedSwap = process.argv[3];

if (process.argv[2] === 'local') url = 'http://localhost:4000';
else if (process.argv[2] === 'goerli') url = 'https://api-goerli.mistx.io';
else if (process.argv[2] === 'staging') url = 'https://api-staging.mistx.io';
else if (process.argv[2] === 'prod') url = 'https://api.mistx.io';
else serializedSwap = process.argv[2];

console.log('Will connect sockets to ' + url);
const ioClient = io(url, { transports: ['websocket'] });

ioClient.on('disconnect', (reason) => {
  console.log('socket disconnected', reason);
});

ioClient.on('connect', () => {
  console.log('client connected');

  const tx = {
    serializedSwap: serializedSwap
  };

  console.log('Requesting events for %o', tx);

  ioClient.emit('TRANSACTION_EVENTS_REQUEST', tx);
});

ioClient.on('SOCKET_ERR', (err) => {
  console.log('err', err);
  process.exit(1);
});

ioClient.on('TRANSACTION_EVENTS_RESPONSE', (response) => {
  for (const e of response.events) {
    e.utcdate = new Date(e.timestamp).toUTCString();
  }
  console.log('Transaction EVENTS Response');
  process.stdout.write(JSON.stringify(response, null, 4));
  process.exit();
});
