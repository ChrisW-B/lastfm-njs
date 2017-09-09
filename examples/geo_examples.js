const LastFm = require('../lib');
const config = require('./config');

const lfm = new LastFm({
  apiKey: config.key,
  apiSecret: config.secret,
  username: config.username
});

const printRes = function (res) {
  console.log(res);
};
const printError = function (error) {
  console.error(`ERROR: ${JSON.stringify(error)}`);
};

lfm.geo_getTopArtists({
  country: 'United States',
  limit: 5,
  callback(resp) {
    console.log(resp);
  }
});

lfm.geo_getTopArtists({
  country: 'United States',
  limit: 5
}).then(printRes).catch(printError);

lfm.geo_getTopTracks({
  country: 'Spain',
  limit: 5,
  callback(resp) {
    console.log(resp);
  }
});

lfm.geo_getTopTracks({
  country: 'Spain',
  limit: 5
}).then(printRes, printError);