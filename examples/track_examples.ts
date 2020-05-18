const LastFm = require('../lib');
const config = require('./config');

const lfm = new LastFm({
  apiKey: config.key,
  apiSecret: config.secret,
  username: config.username,
  password: config.password,
});

const printRes = function(res) {
  console.log(res);
};
const printError = function(error) {
  console.error(`ERROR: ${JSON.stringify(error)}`);
};

lfm.auth_getMobileSession(res => {
  if (res.success) {
    lfm.track_addTags({
      artist: 'Bad Bad Hats',
      track: 'Psychic Reader',
      tags: 'Indie Pop,Female Vocalist,music',
      callback(resp) {
        console.log(resp);
      },
    });

    lfm.track_love({
      track: "My Body's Made of Crushed Little Stars",
      artist: 'Mitski',
      callback(resp) {
        console.log(resp);
      },
    });

    lfm.track_removeTag({
      artist: 'Bad Bad Hats',
      track: 'Psychic Reader',
      tag: 'test2',
      callback(resp) {
        console.log(resp);
      },
    });

    const now = new Date().getTime();
    lfm.track_scrobble({
      artist: ['Mitski', 'Half Waif'],
      track: ['Happy', 'Harvest'],
      timestamp: [Math.floor(now / 1000), Math.floor(Date.now() / 1000) - 200],
      callback(resp) {
        console.log(resp);
      },
    });

    lfm.track_unlove({
      track: "My Body's Made of Crushed Little Stars",
      artist: 'Mitski',
      callback(resp) {
        console.log(resp);
      },
    });
    lfm.track_updateNowPlaying({
      track: "My Body's Made of Crushed Little Stars",
      artist: 'Mitski',
      callback(resp) {
        console.log(resp);
      },
    });
  }
});

lfm
  .auth_getMobileSession()
  .then(() => {
    lfm
      .track_addTags({
        artist: 'Bad Bad Hats',
        track: 'Psychic Reader',
        tags: 'test2,test3',
      })
      .then(printRes)
      .catch(printError);

    lfm
      .track_love({
        track: 'Juicy',
        artist: 'Radiation City',
      })
      .then(printRes, printError);

    lfm
      .track_removeTag({
        artist: 'Bad Bad Hats',
        track: 'Psychic Reader',
        tag: 'test3',
      })
      .then(printRes, printError);

    const now = new Date().getTime();
    lfm
      .track_scrobble({
        artist: ['Mitski', 'Half Waif'],
        track: ['Happy', 'Harvest'],
        timestamp: [Math.floor(now / 1000), Math.floor(Date.now() / 1000) - 200],
      })
      .then(printRes, printError);

    lfm
      .track_unlove({
        track: 'Juicy',
        artist: 'Radiation City',
      })
      .then(printRes)
      .catch(printError);

    lfm
      .track_updateNowPlaying({
        track: 'Juicy',
        artist: 'Radiation City',
      })
      .then(printRes, printError);
  })
  .catch(printError);

lfm.track_getCorrection({
  artist: 'Guns and Roses',
  track: 'Mrbrownstone',
  callback(res) {
    console.log(res);
  },
});

lfm
  .track_getCorrection({
    artist: 'Guns and Roses',
    track: 'Mrbrownstone',
  })
  .then(printRes)
  .catch(printError);

lfm.track_getInfo({
  artist: 'Half Waif',
  track: 'All My Armor',
  username: 'Christo27',
  callback(res) {
    console.log(res);
  },
});

lfm
  .track_getInfo({
    artist: 'Half Waif',
    track: 'All My Armor',
    username: 'Christo27',
  })
  .then(printRes)
  .catch(printError);

lfm.track_getSimilar({
  artist: 'Cher',
  track: 'Believe',
  limit: 5,
  callback(res) {
    console.log(res);
  },
});

lfm
  .track_getSimilar({
    artist: 'Cher',
    track: 'Believe',
    limit: 5,
  })
  .then(printRes)
  .catch(printError);

lfm.track_getTags({
  artist: 'Bad Bad Hats',
  track: 'Psychic Reader',
  user: 'Christo27',
  callback(res) {
    console.log(res);
  },
});

lfm
  .track_getTags({
    artist: 'Bad Bad Hats',
    track: 'Psychic Reader',
    user: 'Christo27',
  })
  .then(printRes, printError);

lfm.track_getTopTags({
  artist: 'Mitski',
  track: 'Your Best American Girl',
  callback(res) {
    console.log(res);
  },
});

lfm
  .track_getTopTags({
    artist: 'Mitski',
    track: 'Your Best American Girl',
  })
  .then(printRes)
  .catch(printError);

lfm.track_search({
  track: 'Cruel World',
  limit: 5,
  callback(res) {
    console.log(res);
  },
});

lfm
  .track_search({
    track: 'Cruel World',
    limit: 5,
  })
  .then(printRes)
  .catch(printError);
