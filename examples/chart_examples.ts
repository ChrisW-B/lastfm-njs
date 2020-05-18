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

lfm.chart_getTopArtists({
  limit: 5,
  callback(resp) {
    console.log(resp);
  },
});

lfm
  .chart_getTopArtists({
    limit: 5,
  })
  .then(printRes, printError);

lfm.chart_getTopTags({
  limit: 5,
  page: 2,
  callback(resp) {
    console.log(resp);
  },
});

lfm
  .chart_getTopTags({
    limit: 5,
    page: 2,
  })
  .then(printRes, printError);

lfm.chart_getTopTracks({
  limit: 5,
  callback(resp) {
    console.log(resp);
  },
});

lfm
  .chart_getTopTracks({
    limit: 5,
  })
  .then(printRes)
  .catch(printError);
