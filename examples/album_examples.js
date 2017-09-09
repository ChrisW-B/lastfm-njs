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
    lfm.album_addTags({
      artist: 'Oh Pep!',
      album: 'Living',
      tags: 'peppy,folk,music',
      callback(resp) {
        console.log(`result is: ${resp}`);
      }
    });

    lfm.album_removeTag({
      artist: 'Oh Pep!',
      album: 'Living',
      tag: 'peppy',
      callback(resp) {
        console.log(`done! result is: ${resp}`);
      }
    });
  }
});

lfm.auth_getMobileSession().then(() => {
  lfm.album_addTags({
    artist: 'Oh Pep!',
    album: 'Living',
    tags: 'oh pep!,peppy,music'
  }).then(printRes).catch(printError);

  lfm.album_removeTag({
    artist: 'Oh Pep!',
    album: 'Living',
    tag: 'music'
  }).then(printRes).catch(printError);
}).catch(printError);

lfm.album_getInfo({
  artist: 'PWR BTTM',
  album: 'Ugly Cherries',
  username: 'Christo27',
  callback(resp) {
    console.log(resp);
  }
});
lfm.album_getInfo({
  artist: 'PWR BTTM',
  album: 'Ugly Cherries',
  username: 'Christo27'
}).then(printRes).catch(printError);

lfm.album_getTags({
  artist: 'Oh Pep!',
  album: 'Living',
  username: 'Christo27',
  callback(resp) {
    console.log(resp);
  }
});
lfm.album_getInfo({
  artist: 'Oh Pep!',
  album: 'Living',
  username: 'Christo27'
}).then(printRes).catch(printError);

lfm.album_getTopTags({
  artist: 'Pale Honey',
  album: 'Pale Honey',
  callback(resp) {
    console.log(resp);
  }
});

lfm.album_getTopTags({
  artist: 'Pale Honey',
  album: 'Pale Honey'
}).then(printRes).catch(printError);

lfm.album_search({
  album: 'Sprinter',
  page: 2,
  limit: 5,
  callback(resp) {
    console.log(resp);
  }
});

lfm.album_search({
  album: 'Sprinter',
  page: 2,
  limit: 5
}).then(printRes).catch(printError);