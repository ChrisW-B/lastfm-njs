const rp = require('request-promise-native');
const crypto = require('crypto');

module.exports = class LastFM {
  constructor(opts) {
    this.debug = opts.debug || false;
    if (opts.apiKey !== undefined && opts.apiKey !== '') { this.apiKey = opts.apiKey; }
    if (opts.apiSecret !== undefined && opts.apiSecret !== '') { this.apiSecret = opts.apiSecret; }
    if (opts.username !== undefined && opts.username !== '') { this.username = opts.username; }
    if (opts.password !== undefined && opts.password !== '') { this.password = opts.password; }
    if (opts.sessionKey !== undefined && opts.sessionKey !== '') { this.sessionKey = opts.sessionKey; }
  }

  auth_getMobileSession() {
    const self = this;
    const qs = {
      method: 'auth.getMobileSession',
      username: this.username,
      password: this.password
    };
    return this._postData(qs)
      .then((res) => {
        self.sessionKey = res.session.key;
      })
      .catch(e => this._sendErr(e));
  }

  static _sendErr(msg, callback) {
    // handles error checking within library,
    // whether using callbacks or promises
    const errMsg = { error: 6, message: msg };
    if (callback) {
      errMsg.success = false;
      callback(errMsg);
      return null;
    }
    return new Promise((_, reject) => {
      reject(errMsg);
    });
  }

  static _createSignature(params, secret) {
    // create signature by hashing
    let sig = '';
    Object.keys(params).sort().forEach((key) => {
      if (key !== 'format' && key !== 'callback') {
        // ignore format and callback keys
        // bc last.fm doesnt use format
        if (params[key] instanceof Array) {
          for (let i = 0; i < params[key].length; i++) {
            sig += `${key}[${i}]${params[key][i]}`;
          }
        } else {
          const value = typeof params[key] !== 'undefined' && params[key] !== null ? params[key] : '';
          sig += key + value;
        }
      }
    });
    sig += secret;
    return crypto.createHash('md5').update(sig, 'utf8').digest('hex');
  }

  _getData(qs) {
    return new Promise((resolve, reject) => {
      const opt = {
        method: 'GET',
        uri: 'http://ws.audioscrobbler.com/2.0/',
        json: true,
        qs: { ...qs, api_key: this.apiKey, format: 'json' }
      };
      rp(opt).then((res) => {
        if (res.error) reject(res);
        else resolve(res);
      }).catch((err) => {
        if (this.debug) console.log(`Exception: ${err}`);
        reject({ success: false, error: err });
      });
    });
  }

  _postData(params) {
    return new Promise((resolve, reject) => {
      const qs = {
        ...params,
        api_key: this.apiKey,
        format: 'json'
      };
      if (this.sessionKey) qs.sk = this.sessionKey;
      qs.api_sig = this.constructor._createSignature(qs, this.apiSecret);
      const opt = { uri: 'https://ws.audioscrobbler.com/2.0/', qs, json: true };
      rp.post(opt)
        .then(res => resolve(res))
        .catch((err) => {
          if (this.debug) console.log(`Exception: ${err}`);
          reject({ success: false, err });
        });
    });
  }

  _get(qs, name, callback) {
    if (callback) {
      this._getData(qs).then((res) => {
        res[name].success = true;
        callback(res[name]);
      }).catch((err) => {
        callback(err);
      });
      return null;
    }
    return new Promise((resolve, reject) => {
      this._getData(qs).then((res) => {
        resolve(res[name]);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  _post(qs, callback) {
    if (callback) {
      this._postData(qs).then((res) => {
        res.success = true;
        callback(res);
      }).catch(err => callback({ ...err, success: false }));
      return null;
    }
    return this._postData(qs);
  }

  // album methods
  album_addTags(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined
      || qs.album === '' || qs.album === undefined
      || qs.tags === '' || qs.tags === undefined) {
      return this._sendErr('Missing required params', qs.callback);
    }
    qs.method = 'album.addTags';
    return this._post(qs, qs.callback);
  }

  album_getInfo(opt) {
    const qs = opt || {};
    if (qs.username === '' || qs.username === undefined
      || ((qs.artist === '' || qs.artist === undefined
          || qs.album === '' || qs.album === undefined)
        && (qs.mbid === '' || qs.mbid === undefined))) {
      return this._sendErr('Missing required params', qs.callback);
    }
    return this._get({ ...qs, method: 'album.getInfo', autocorrect: 1 }, 'album', qs.callback);
  }

  album_getTags(opt) {
    const qs = opt || {};
    if ((qs.artist === '' || qs.artist === undefined
        || qs.album === '' || qs.album === undefined)
      && (qs.mbid === '' || qs.mbid === undefined)) {
      return this._sendErr('Missing required params', qs.callback);
    }
    return this._get({ ...qs, method: 'album.getTags', autocorrect: 1 }, 'tags', qs.callback);
  }

  album_getTopTags(opt) {
    const qs = opt || {};
    if ((qs.artist === '' || qs.artist === undefined
        || qs.album === '' || qs.album === undefined)
      && (qs.mbid === '' || qs.mbid === undefined)) {
      return this._sendErr('Missing required params', qs.callback);
    }
    return this._get({ ...qs, method: 'album.getTopTags', autocorrect: 1 }, 'toptags', qs.callback);
  }

  album_removeTag(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined
      || qs.album === '' || qs.album === undefined
      || qs.tag === '' || qs.tag === undefined) {
      return this._sendErr('Missing required params', qs.callback);
    }
    qs.method = 'album.removeTag';
    return this._post(qs, qs.callback);
  }

  album_search(opt) {
    const qs = opt || {};
    if (qs.album === '' || qs.album === undefined) {
      return this._sendErr('Missing album param', qs.callback);
    }
    return this._get({ ...qs, method: 'album.search', autocorrect: 1 }, 'results', qs.callback);
  }

  // Artist methods
  artist_addTags(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined || qs.tags === '' || qs.tags === undefined) {
      return this._sendErr('Missing required parameters', qs.callback);
    }
    qs.method = 'artist.addTags';
    return this._post(qs, qs.callback);
  }

  artist_getCorrection(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined) {
      return this._sendErr('Missing Artist', qs.callback);
    }
    qs.method = 'artist.getCorrection';
    return this._get(qs, 'corrections', qs.callback);
  }

  artist_getInfo(opt) {
    const qs = opt || {};
    if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
      return this._sendErr('Missing both artist and mbid', qs.callback);
    }

    return this._get({ ...qs, method: 'artist.getInfo', autocorrect: 1 }, 'artist', qs.callback);
  }

  artist_getSimilar(opt) {
    const qs = opt || {};
    if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
      return this._sendErr('Missing both artist and mbid', qs.callback);
    }
    return this._get({ ...qs, method: 'artist.getSimilar', autocorrect: 1 }, 'similarartists', qs.callback);
  }

  artist_getTags(opt) {
    const qs = opt || {};
    if (((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined))
      || (qs.user === '' || qs.user === undefined)) {
      return this._sendErr('Missing both artist and mbid', qs.callback);
    }
    return this._get({ ...qs, method: 'artist.getTags', autocorrect: 1 }, 'tags', qs.callback);
  }

  artist_getTopAlbums(opt) {
    const qs = opt || {};
    if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
      return this._sendErr('Missing both artist and mbid', qs.callback);
    }
    return this._get({ ...qs, method: 'artist.getTopAlbums', autocorrect: 1 }, 'topalbums', qs.callback);
  }

  artist_getTopTags(opt) {
    const qs = opt || {};
    if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
      return this._sendErr('Missing both artist and mbid', qs.callback);
    }
    return this._get({ ...qs, method: 'artist.getTopTags', autocorrect: 1 }, 'toptags', qs.callback);
  }

  artist_getTopTracks(opt) {
    const qs = opt || {};
    if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
      return this._sendErr('Missing both artist and mbid', qs.callback);
    }
    return this._get({ ...qs, method: 'artist.getTopTracks', autocorrect: 1 }, 'toptracks', qs.callback);
  }

  artist_removeTag(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined || qs.tag === '' || qs.tag === undefined) {
      return this._sendErr('Missing required parameters', qs.callback);
    }
    qs.method = 'artist.removeTag';
    return this._post(qs, qs.callback);
  }

  artist_search(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined) {
      return this._sendErr('Missing artist to search', qs.callback);
    }
    return this._get({ ...qs, method: 'artist.search', autocorrect: 1 }, 'results', qs.callback);
  }

  // Chart Methods
  chart_getTopArtists(opt) {
    const qs = opt || {};
    return this._get({ ...qs, method: 'chart.getTopArtists', autocorrect: 1 }, 'artists', qs.callback);
  }

  chart_getTopTags(opt) {
    const qs = opt || {};
    return this._get({ ...qs, method: 'chart.getTopTags', autocorrect: 1 }, 'tags', qs.callback);
  }

  chart_getTopTracks(opt) {
    const qs = opt || {};
    return this._get({ ...qs, method: 'chart.getTopTracks', autocorrect: 1 }, 'tracks', qs.callback);
  }

  // Geo Methods
  geo_getTopArtists(opt) {
    const qs = opt || {};
    if (qs.country === '' || qs.country === undefined) {
      return this._sendErr('Missing country', qs.callback);
    }
    return this._get({ ...qs, method: 'geo.getTopArtists', autocorrect: 1 }, 'topartists', qs.callback);
  }

  geo_getTopTracks(opt) {
    const qs = opt || {};
    if (qs.country === '' || qs.country === undefined) {
      return this._sendErr('Missing country', qs.callback);
    }
    return this._get({ ...qs, method: 'geo.getTopTracks', autocorrect: 1 }, 'tracks', qs.callback);
  }

  // Library Methods
  library_getArtists(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      return this._sendErr('Missing username', qs.callback);
    }
    return this._get({ ...qs, method: 'library.getArtists', autocorrect: 1 }, 'artists', qs.callback);
  }

  // Tag Methods
  tag_getInfo(opt) {
    const qs = opt || {};
    if (qs.tag === '' || qs.tag === undefined) {
      return this._sendErr('No tag given', qs.callback);
    }
    qs.method = 'tag.getInfo';
    return this._get(qs, 'tag', qs.callback);
  }

  tag_getSimilar(opt) {
    const qs = opt || {};
    if (qs.tag === '' || qs.tag === undefined) {
      return this._sendErr('No tag given', qs.callback);
    }
    qs.method = 'tag.getSimilar';
    return this._get(qs, 'similartags', qs.callback);
  }

  tag_getTopAlbums(opt) {
    const qs = opt || {};
    if (qs.tag === '' || qs.tag === undefined) {
      return this._sendErr('No tag given', qs.callback);
    }
    qs.method = 'tag.getTopAlbums';
    return this._get(qs, 'albums', qs.callback);
  }

  tag_getTopArtists(opt) {
    const qs = opt || {};
    if (qs.tag === '' || qs.tag === undefined) {
      return this._sendErr('No tag given', qs.callback);
    }
    qs.method = 'tag.getTopArtists';
    return this._get(qs, 'topartists', qs.callback);
  }

  tag_getTopTags(opt) {
    const qs = opt || {};
    qs.method = 'tag.getTopTags';
    return this._get(qs, 'toptags', qs.callback);
  }

  tag_getTopTracks(opt) {
    const qs = opt || {};
    if (qs.tag === '' || qs.tag === undefined) {
      return this._sendErr('No tag given', qs.callback);
    }
    qs.method = 'tag.getTopTracks';
    return this._get(qs, 'tracks', qs.callback);
  }

  tag_getWeeklyChartList(opt) {
    const qs = opt || {};
    if (qs.tag === '' || qs.tag === undefined) {
      return this._sendErr('No tag given', qs.callback);
    }
    qs.method = 'tag.getWeeklyChartList';
    return this._get(qs, 'weeklychartlist', qs.callback);
  }

  // Track methods
  track_addTags(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined
      || qs.track === '' || qs.track === undefined
      || qs.tags === '' || qs.tags === undefined) {
      return this._sendErr('Missing required params', qs.callback);
    }
    qs.method = 'track.addTags';
    return this._post(qs, qs.callback);
  }

  track_getCorrection(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined || qs.track === '' || qs.track === undefined) {
      return this._sendErr('Missing required params', qs.callback);
    }
    qs.method = 'track.getCorrection';
    return this._get(qs, 'corrections', qs.callback);
  }

  track_getInfo(opt) {
    const qs = opt || {};
    if ((qs.artist === '' || qs.artist === undefined || qs.track === '' || qs.track === undefined)
      && (qs.mbid === '' || qs.mbid === undefined)) {
      return this._sendErr('Missing required params', qs.callback);
    }
    return this._get({ ...qs, method: 'track.getInfo', autocorrect: 1 }, 'track', qs.callback);
  }

  track_getSimilar(opt) {
    const qs = opt || {};
    if ((qs.artist === '' || qs.artist === undefined
        || qs.track === '' || qs.track === undefined)
      && (qs.mbid === '' || qs.mbid === undefined)) {
      return this._sendErr('Missing both artist and mbid', qs.callback);
    }
    return this._get({ ...qs, method: 'track.getSimilar', autocorrect: 1 }, 'similartracks', qs.callback);
  }

  track_getTags(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined
      || ((qs.artist === '' || qs.artist === undefined
          || qs.track === '' || qs.track === undefined)
        && (qs.mbid === '' || qs.mbid === undefined))) {
      return this._sendErr('Missing required params', qs.callback);
    }
    return this._get({ ...qs, method: 'track.getTags', autocorrect: 1 }, 'tags', qs.callback);
  }

  track_getTopTags(opt) {
    const qs = opt || {};
    if ((qs.artist === '' || qs.artist === undefined
        || qs.track === '' || qs.track === undefined)
      && (qs.mbid === '' || qs.mbid === undefined)) {
      return this._sendErr('Missing required params', qs.callback);
    }
    return this._get({ ...qs, method: 'track.getTopTags', autocorrect: 1 }, 'toptags', qs.callback);
  }

  track_love(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined
      || qs.track === '' || qs.track === undefined) {
      return this._sendErr('Missing required params', qs.callback);
    }
    return this._postData({ ...qs, method: 'track.love' }, qs.callback);
  }

  track_removeTag(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined
      || qs.track === '' || qs.track === undefined
      || qs.tag === '' || qs.tag === undefined) {
      return this._sendErr('Missing required params', qs.callback);
    }
    qs.method = 'track.removeTag';
    return this._post(qs, qs.callback);
  }

  track_scrobble(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined
      || qs.track === '' || qs.track === undefined
      || qs.timestamp === '' || qs.timestamp === undefined) {
      return this._sendErr('Missing required params', qs.callback);
    }
    qs.method = 'track.scrobble';
    return this._post(qs, qs.callback);
  }

  track_search(opt) {
    const qs = opt || {};
    if (qs.track === '' || qs.track === undefined) {
      return this._sendErr('Missing track for search', qs.callback);
    }
    return this._get({ ...qs, method: 'track.search', autocorrect: 1 }, 'results', qs.callback);
  }

  track_unlove(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined
      || qs.track === '' || qs.track === undefined) {
      return this._sendErr('Missing track or artist', qs.callback);
    }
    qs.method = 'track.unlove';
    return this._post(qs, qs.callback);
  }

  track_updateNowPlaying(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined
      || qs.track === '' || qs.track === undefined) {
      return this._sendErr('Missing track or artist', qs.callback);
    }
    qs.method = 'track.updateNowPlaying';
    return this._post(qs, qs.callback);
  }

  // User Methods
  user_getArtistTracks(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined) {
      return this._sendErr('Missing artist', qs.callback);
    }
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return this._sendErr('Missing user', qs.callback);
      }
      qs.user = this.username;
    }
    qs.method = 'user.getArtistTracks';
    return this._get(qs, 'artisttracks', qs.callback);
  }

  user_getFriends(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return this._sendErr('Missing user', qs.callback);
      }
      qs.user = this.username;
    }
    qs.method = 'user.getFriends';
    return this._get(qs, 'friends', qs.callback);
  }

  user_getInfo(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return this._sendErr('Missing user', qs.callback);
      }
      qs.user = this.username;
    }
    qs.method = 'user.getInfo';
    return this._get(qs, 'user', qs.callback);
  }

  user_getLovedTracks(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return this._sendErr('Missing user', qs.callback);
      }
      qs.user = this.username;
    }
    qs.method = 'user.getLovedTracks';
    return this._get(qs, 'lovedtracks', qs.callback);
  }

  user_getPersonalTags(opt) {
    const qs = opt || {};
    if (qs.tag === '' || qs.tag === undefined) {
      return this._sendErr('Missing tag', qs.callback);
    }
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return this._sendErr('Missing user', qs.callback);
      }
      qs.user = this.username;
    }
    qs.method = 'user.getPersonalTags';
    return this._get(qs, 'taggings', qs.callback);
  }

  user_getRecentTracks(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return this._sendErr('Missing user', qs.callback);
      }
      qs.user = this.username;
    }
    qs.method = 'user.getRecentTracks';
    return this._get(qs, 'recenttracks', qs.callback);
  }

  user_getTopAlbums(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return this._sendErr('Missing user', qs.callback);
      }
      qs.user = this.username;
    }
    qs.method = 'user.getTopAlbums';
    return this._get(qs, 'topalbums', qs.callback);
  }

  user_getTopArtists(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return this._sendErr('Missing user', qs.callback);
      }
      qs.user = this.username;
    }
    qs.method = 'user.getTopArtists';
    return this._get(qs, 'topartists', qs.callback);
  }

  user_getTopTags(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return this._sendErr('Missing user', qs.callback);
      }
      qs.user = this.username;
    }
    qs.method = 'user.getTopTags';
    return this._get(qs, 'toptags', qs.callback);
  }

  user_getTopTracks(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return this._sendErr('Missing user', qs.callback);
      }
      qs.user = this.username;
    }
    qs.method = 'user.getTopTracks';
    return this._get(qs, 'toptracks', qs.callback);
  }

  user_getWeeklyAlbumChart(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return this._sendErr('Missing user', qs.callback);
      }
      qs.user = this.username;
    }
    qs.method = 'user.getWeeklyAlbumChart';
    return this._get(qs, 'weeklyalbumchart', qs.callback);
  }

  user_getWeeklyArtistChart(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return this._sendErr('Missing user', qs.callback);
      }
      qs.user = this.username;
    }
    qs.method = 'user.getWeeklyArtistChart';
    return this._get(qs, 'weeklyartistchart', qs.callback);
  }

  user_getWeeklyChartList(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return this._sendErr('Missing user', qs.callback);
      }
      qs.user = this.username;
    }
    qs.method = 'user.getWeeklyChartList';
    return this._get(qs, 'weeklychartlist', qs.callback);
  }

  user_getWeeklyTrackChart(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return this._sendErr('Missing user', qs.callback);
      }
      qs.user = this.username;
    }
    qs.method = 'user.getWeeklyTrackChart';
    return this._get(qs, 'weeklytrackchart', qs.callback);
  }
};