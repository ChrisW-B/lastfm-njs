const LastFm = require('../lib');
const config = require('./config');

const lfm = new LastFm({
  apiKey: config.key,
  apiSecret: config.secret,
  username: config.username,
  password: config.password
});

const printRes = function (res) {
  console.log(res);
};
const printError = function (error) {
  console.error(`ERROR: ${JSON.stringify(error)}`);
};

lfm.auth_getMobileSession((res) => {
  if (res.success) {
    lfm.artist_addTags({
      artist: 'Lucy Dacus',
      tags: 'folk,dacus,music',
      callback(resp) {
        console.log(`done! result is: ${JSON.stringify(resp)}`);
      }
    });
    lfm.artist_removeTag({
      artist: 'Lucy Dacus',
      tag: 'dacus',
      callback(resp) {
        console.log(`done! result is: ${resp}`);
      }
    });
  }
});

lfm.auth_getMobileSession().then(() => {
  lfm.artist_addTags({
    artist: 'Lucy Dacus',
    tags: 'folk,dacus,music'
  }).then(printRes);
  lfm.artist_removeTag({
    artist: 'Lucy Dacus',
    tag: 'music'
  }).then(printRes, printError);
}).catch(printError);

lfm.artist_getCorrection({
  artist: 'Guns and Roses',
  callback(resp) {
    console.log(resp);
  }
});

lfm.artist_getCorrection({
  artist: 'Guns and Roses'
}).then(printRes).catch(printError);

lfm.artist_getInfo({
  artist: 'Thao & The Get Down Stay Down',
  username: 'Christo27',
  callback(resp) {
    console.log(resp);
  }
});

lfm.artist_getInfo({
  artist: 'Thao & The Get Down Stay Down',
  username: 'Christo27'
}).then(printRes).catch(printError);

lfm.artist_getSimilar({
  artist: 'Waxahatchee',
  limit: 5,
  callback(resp) {
    console.log(resp);
  }
});

lfm.artist_getSimilar({
  artist: 'Waxahatchee',
  limit: 5
}).then(printRes).catch(printError);

lfm.artist_getTags({
  artist: 'Lucy Dacus',
  user: 'Christo27',
  callback(resp) {
    console.log(resp);
  }
});

lfm.artist_getTags({
  artist: 'Lucy Dacus',
  user: 'Christo27'
}).then(printRes).catch(printError);

lfm.artist_getTopAlbums({
  artist: 'A Camp',
  limit: 2,
  callback(resp) {
    console.log(resp);
  }
});

lfm.artist_getTopAlbums({
  artist: 'A Camp',
  limit: 2
}).then(printRes, printError);

lfm.artist_getTopTags({
  artist: 'Broken Social Scene',
  callback(resp) {
    console.log(resp);
  }
});

lfm.artist_getTopTags({
  artist: 'Broken Social Scene'
}).then(printRes, printError);

lfm.artist_getTopTracks({
  artist: 'Shamir',
  limit: 5,
  callback(resp) {
    console.log(resp);
  }
});

lfm.artist_getTopTracks({
  artist: 'Shamir',
  limit: 5
}).then(printRes, printError);

lfm.artist_search({
  artist: 'Stars',
  limit: 3,
  callback(resp) {
    console.log(resp);
  }
});

lfm.artist_search({
  artist: 'Stars',
  limit: 3
}).then(printRes, printError);