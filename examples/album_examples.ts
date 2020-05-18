import LastFm from '../lib';

const lfm = new LastFm({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
});

const printRes = (res: object | string): void => {
  console.log(res);
};
const printError = (error: Error): void => {
  console.error(`ERROR: ${JSON.stringify(error)}`);
};

const asyncGetAlbumData = async () => {
  const auth = await lfm.auth_getMobileSession();
  if (auth.success) {
    const addTags = await lfm.album_addTags({ artist: 'Oh Pep!', album: 'Living', tags: 'oh pep!,peppy,music' });
    printRes(addTags);
    const rmTags = await lfm.album_removeTag({ artist: 'Oh Pep!', album: 'Living', tag: 'music' });
    printRes(rmTags);
  }
  const albumInfo = await lfm.album_getInfo({
    artist: 'Sidney Gish',
    album: '!Ed Buys Houses!',
    username: 'Christo27',
  });
  printRes(albumInfo);
  const topTags = await lfm.album_getTopTags({
    artist: 'Pale Honey',
    album: 'Pale Honey',
  });
  printRes(topTags);
  const search = await lfm.album_search({ album: 'Sprinter', page: 2, limit: 5 });
  printRes(search);
};
lfm.auth_getMobileSession((res) => {
  if (res.success) {
    lfm.album_addTags({
      artist: 'Oh Pep!',
      album: 'Living',
      tags: 'peppy,folk,music',
      callback(resp) {
        console.log(`result is: ${resp}`);
      },
    });

    lfm.album_removeTag({
      artist: 'Oh Pep!',
      album: 'Living',
      tag: 'peppy',
      callback(resp) {
        console.log(`done! result is: ${resp}`);
      },
    });
  }
});

lfm.album_getInfo({
  artist: 'Sidney Gish',
  album: '!Ed Buys Houses!',
  username: 'Christo27',
  callback(resp) {
    console.log(resp);
  },
});

lfm.album_getTags({
  artist: 'Oh Pep!',
  album: 'Living',
  username: 'Christo27',
  callback(resp) {
    console.log(resp);
  },
});

lfm.album_getTopTags({
  artist: 'Pale Honey',
  album: 'Pale Honey',
  callback(resp) {
    console.log(resp);
  },
});

lfm.album_search({
  album: 'Sprinter',
  page: 2,
  limit: 5,
  callback(resp) {
    console.log(resp);
  },
});
asyncGetAlbumData();
