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

lfm.tag_getInfo({
  tag: 'Indie',
  callback(resp) {
    console.log(resp);
  }
});

lfm.tag_getInfo({
  tag: 'Indie'
}).then(printRes, printError);

lfm.tag_getSimilar({
  tag: 'Baroque Pop',
  callback(resp) {
    console.log(resp);
  }
});

lfm.tag_getSimilar({
  tag: 'Pop'
}).then(printRes, printError);

lfm.tag_getTopAlbums({
  tag: 'Happy',
  limit: 3,
  callback(resp) {
    console.log(resp);
  }
});

lfm.tag_getTopAlbums({
  tag: 'Happy',
  limit: 3
}).then(printRes).catch(printError);

lfm.tag_getTopArtists({
  tag: 'Indie Rock',
  limit: 3,
  callback(resp) {
    console.log(resp);
  }
});

lfm.tag_getTopArtists({
  tag: 'Baroque Pop',
  limit: 3
}).then(printRes, printError);

lfm.tag_getTopTags({
  callback(resp) {
    console.log(resp);
  }
});

lfm.tag_getTopTags()
  .then(printRes)
  .catch(printError);

lfm.tag_getTopTracks({
  tag: 'Musical',
  limit: 5,
  callback(resp) {
    console.log(resp);
  }
});

lfm.tag_getTopTracks({
  tag: 'musical',
  limit: 5
}).then(printRes).catch(printError);

lfm.tag_getWeeklyChartList({
  tag: 'Baroque Pop',
  callback(resp) {
    console.log(resp);
  }
});

lfm.tag_getWeeklyChartList({
  tag: 'Baroque Pop'
}).then(printRes).catch(printError);