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

lfm.user_getArtistTracks({
  // user: 'Christo27', //defaults to authenticated user,
  artist: 'Sylvan Esso',
  callback(resp) {
    console.log(resp);
  }
});

lfm.user_getArtistTracks({
  // user: 'Christo27', //defaults to authenticated user,
  artist: 'Sylvan Esso'
}).then(printRes, printError);

lfm.user_getFriends({
  // user: 'Christo27', //defaults to authenticated user,
  recenttracks: true,
  callback(resp) {
    console.log(resp);
  }
});

lfm.user_getFriends({
  // user: 'Christo27', //defaults to authenticated user,
  recenttracks: true
}).then(printRes, printError);

lfm.user_getInfo({
  // user: 'Christo27', //defaults to authenticated user, //defaults to authenticated user
  callback(resp) {
    console.log(resp);
  }
});

lfm.user_getInfo().then(printRes).catch(printError);

lfm.user_getLovedTracks({
  // user: 'Christo27', //defaults to authenticated user,
  limit: 5,
  callback(resp) {
    console.log(resp);
  }
});

lfm.user_getLovedTracks().then(printRes).catch(printError);

lfm.user_getPersonalTags({
  // user: 'Christo27', //defaults to authenticated user,
  tag: 'folk',
  taggingtype: 'artist',
  callback(resp) {
    console.log(resp);
  }
});

lfm.user_getPersonalTags({
  // user: 'Christo27', //defaults to authenticated user,
  tag: 'folk',
  taggingtype: 'artist'
}).then(printRes, printError);

lfm.user_getRecentTracks({
  // user: 'Christo27', //defaults to authenticated user,
  limit: 5,
  callback(resp) {
    console.log(resp);
  }
});

lfm.user_getRecentTracks({
  // user: 'Christo27', //defaults to authenticated user,
  limit: 5
}).then(printRes, printError);

lfm.user_getTopAlbums({
  // user: 'Christo27', //defaults to authenticated user,
  period: '1month',
  limit: 5,
  callback(resp) {
    console.log(resp);
  }
});

lfm.user_getTopAlbums({
  period: '1year'
}).then(printRes, printError);

lfm.user_getTopArtists({
  // user: 'Christo27', //defaults to authenticated user,
  period: '1month',
  limit: 5,
  callback(resp) {
    console.log(resp);
  }
});

lfm.user_getTopArtists().then(printRes).catch(printError);

lfm.user_getTopTags({
  // user: 'Christo27', //defaults to authenticated user,
  limit: 5,
  callback(resp) {
    console.log(resp);
  }
});

lfm.user_getTopTags({
  limit: 2
}).then(printRes, printError);
lfm.user_getTopTracks({
  // user: 'Christo27', //defaults to authenticated user,
  period: '1month',
  limit: 5,
  callback(resp) {
    console.log(resp);
  }
});

lfm.user_getTopTracks().then(printRes, printError);

lfm.user_getWeeklyAlbumChart({
  callback(resp) {
    console.log(resp);
  }
});

lfm.user_getWeeklyAlbumChart().then(printRes, printError);

lfm.user_getWeeklyArtistChart({
  // user: 'Christo27', //defaults to authenticated user,
  callback(resp) {
    console.log(resp);
  }
});

lfm.user_getWeeklyArtistChart().then(printRes, printError);

lfm.user_getWeeklyChartList({
  // user: 'Christo27', //defaults to authenticated user,
  callback(resp) {
    console.log(resp);
  }
});

lfm.user_getWeeklyChartList().then(printRes, printError);

lfm.user_getWeeklyTrackChart({
  // user: 'Christo27', //defaults to authenticated user,
  callback(resp) {
    console.log(resp);
  }
});

lfm.user_getWeeklyTrackChart().then(printRes, printError);