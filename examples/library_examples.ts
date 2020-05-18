const LastFm = require('../lib');
const config = require('./config');

const lfm = new LastFm({
  apiKey: config.key,
  apiSecret: config.secret,
  username: config.username,
});

const printRes = function(res) {
  console.log(res);
};
const printError = function(error) {
  console.error(`ERROR: ${JSON.stringify(error)}`);
};

lfm.library_getArtists({
  user: 'Christo27',
  limit: 5,
  page: 2,
  callback(resp) {
    console.log(resp);
  },
});

lfm
  .library_getArtists({
    user: 'Christo27',
  })
  .then(printRes, printError);
