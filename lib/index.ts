import crypto from 'crypto';

import rp, { Options } from 'request-promise-native';

import {
  AlbumAddTags,
  AlbumGetInfo,
  AlbumGetTags,
  AlbumGetTopTags,
  AlbumInfoRes,
  AlbumRemoveTag,
  AlbumSearch,
  AlbumSearchRes,
  AlbumTagsRes,
  MBIDAlbum,
  NamedAlbum,
} from './dataModel/albumFunctions';
import {
  ArtistAddTags,
  ArtistGetCorrection,
  ArtistGetCorrectionRes,
  ArtistGetInfo,
  ArtistGetInfoRes,
  ArtistGetSimilar,
  ArtistGetSimilarRes,
  ArtistGetTags,
  ArtistGetTagsRes,
  ArtistGetTopAlbums,
  ArtistGetTopAlbumsRes,
  ArtistGetTopTags,
  ArtistGetTopTagsRes,
  ArtistGetTopTracks,
  ArtistGetTopTracksRes,
  ArtistRemoveTag,
  ArtistSearch,
  ArtistSearchRes,
  MBIDArtist,
  NamedArtist,
} from './dataModel/artistFunctions';
import { ErrorMessage, LastFmConstructor, LastFmRequest, PostRequest, ResponseData } from './dataModel/sharedFunctions';

export default class LastFm {
  private debug: boolean;

  private apiKey: string;

  private apiSecret: string;

  private username: string;

  private password: string;

  private sessionKey: string;

  constructor(opts: LastFmConstructor) {
    this.debug = opts.debug || false;
    if (opts.apiKey !== undefined && opts.apiKey !== '') {
      this.apiKey = opts.apiKey;
    }
    if (opts.apiSecret !== undefined && opts.apiSecret !== '') {
      this.apiSecret = opts.apiSecret;
    }
    if (opts.username !== undefined && opts.username !== '') {
      this.username = opts.username;
    }
    if (opts.password !== undefined && opts.password !== '') {
      this.password = opts.password;
    }
    if (opts.sessionKey !== undefined && opts.sessionKey !== '') {
      this.sessionKey = opts.sessionKey;
    }
  }

  private static _sendErr(msg: string): Promise<ErrorMessage> {
    // handles error checking within library,
    // whether using callbacks or promises
    const errMsg: ErrorMessage = { error: 6, message: msg, success: false };
    return new Promise((_, reject) => {
      reject(errMsg);
    });
  }

  private static _PostRequestToString(params: LastFmRequest<Response>): string {
    return Object.entries(params)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce(
        (sig: string, [key, value]: [string, string | string[]]) =>
          key !== 'format' && key !== 'callback'
            ? value instanceof Array
              ? value.reduce((newSig: string, item: string, i) => `${newSig}[${i}]${item}`, sig)
              : `${sig}${key}${typeof value !== 'undefined' && value !== null ? value : ''}`
            : sig,
        '',
      );
  }

  private static _createSignature(params: LastFmRequest<Response>, secret: string): string {
    // create signature by hashing
    const sig: string = this._PostRequestToString(params) + secret;
    return crypto.createHash('md5').update(sig, 'utf8').digest('hex');
  }

  private _getData<Response = Record<string, unknown>>(
    params: LastFmRequest<Response>,
  ): Promise<Record<string, ResponseData<Response>>> {
    return new Promise((resolve, reject) => {
      rp({
        method: 'GET',
        uri: 'http://ws.audioscrobbler.com/2.0/',
        json: true,
        qs: { ...params, api_key: this.apiKey, format: 'json' },
      })
        .then((res: Record<string, ResponseData<Response>>) => (res.error ? reject(res) : resolve(res)))
        .catch((err: ErrorMessage) => {
          if (this.debug) console.log(`Exception: ${err.message}`);
          reject({ success: false, error: err });
        });
    });
  }

  private _postData<Response = Record<string, unknown>>(
    params: LastFmRequest<Response>,
  ): Promise<ResponseData<Response>> {
    return new Promise((resolve, reject) => {
      const qs: PostRequest<Response> = {
        ...params,
        api_key: this.apiKey,
        format: 'json',
        sk: '',
        api_sig: '',
      };
      if (this.sessionKey) qs.sk = this.sessionKey;
      qs.api_sig = LastFm._createSignature(qs, this.apiSecret);
      const opt: Options = { uri: 'https://ws.audioscrobbler.com/2.0/', qs, json: true };
      rp.post(opt)
        .then((res) => resolve(res))
        .catch((err: ErrorMessage) => {
          if (this.debug) console.log(`Exception: ${err.message}`);
          reject({ success: false, err });
        });
    });
  }

  private _get<Response = Record<string, unknown>>(
    qs: LastFmRequest<Response>,
    name: string,
  ): Promise<ResponseData<Response>> {
    return new Promise((resolve, reject) => {
      this._getData<Response>(qs)
        .then((res) => {
          resolve(res[name]);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  private _post<Response = { success: boolean }>(qs: LastFmRequest<Response>): Promise<Response> {
    return this._postData<Response>(qs);
  }

  public async auth_getMobileSession(): Promise<{ key: string; success: boolean } | ErrorMessage> {
    const qs = {
      method: 'auth.getMobileSession',
      username: this.username,
      password: this.password,
    };
    try {
      const res = await this._postData<{ session: { key: string; success: boolean } }>(qs);
      this.sessionKey = res.session.key;
      return res.session;
    } catch (e) {
      return LastFm._sendErr(e);
    }
  }

  // album methods
  album_addTags(qs: AlbumAddTags) {
    if (
      !qs ||
      qs.artist === '' ||
      qs.artist === undefined ||
      qs.album === '' ||
      qs.album === undefined ||
      qs.tags === '' ||
      qs.tags === undefined
    ) {
      return LastFm._sendErr('Missing required params');
    }

    return this._post({ ...qs, method: 'album.addTags' });
  }

  album_getInfo(qs: AlbumGetInfo) {
    if (
      !qs ||
      (((qs as NamedAlbum).artist === '' ||
        (qs as NamedAlbum).artist === undefined ||
        (qs as NamedAlbum).album === '' ||
        (qs as NamedAlbum).album === undefined) &&
        ((qs as MBIDAlbum).mbid === '' || (qs as MBIDAlbum).mbid === undefined))
    ) {
      return LastFm._sendErr('Missing required params');
    }
    return this._get<AlbumInfoRes>({ ...qs, method: 'album.getInfo', autocorrect: 1 }, 'album');
  }

  album_getTags(qs: AlbumGetTags) {
    if (
      !qs ||
      (((qs as NamedAlbum).artist === '' ||
        (qs as NamedAlbum).artist === undefined ||
        (qs as NamedAlbum).album === '' ||
        (qs as NamedAlbum).album === undefined) &&
        ((qs as MBIDAlbum).mbid === '' || (qs as MBIDAlbum).mbid === undefined))
    ) {
      return LastFm._sendErr('Missing required params');
    }
    return this._get<AlbumTagsRes>({ ...qs, method: 'album.getTags', autocorrect: 1 }, 'tags');
  }

  album_getTopTags(qs: AlbumGetTopTags) {
    if (
      !qs ||
      (((qs as NamedAlbum).artist === '' ||
        (qs as NamedAlbum).artist === undefined ||
        (qs as NamedAlbum).album === '' ||
        (qs as NamedAlbum).album === undefined) &&
        ((qs as MBIDAlbum).mbid === '' || (qs as MBIDAlbum).mbid === undefined))
    ) {
      return LastFm._sendErr('Missing required params');
    }
    return this._get<AlbumTagsRes>({ ...qs, method: 'album.getTopTags', autocorrect: 1 }, 'toptags');
  }

  album_removeTag(qs: AlbumRemoveTag) {
    if (
      qs.artist === '' ||
      qs.artist === undefined ||
      qs.album === '' ||
      qs.album === undefined ||
      qs.tag === '' ||
      qs.tag === undefined
    ) {
      return LastFm._sendErr('Missing required params');
    }
    return this._post({ ...qs, method: 'album.removeTag' });
  }

  album_search(qs: AlbumSearch) {
    if (!qs || qs.album === '' || qs.album === undefined) {
      return LastFm._sendErr('Missing album param');
    }
    return this._get<AlbumSearchRes>({ ...qs, method: 'album.search', autocorrect: 1 }, 'results');
  }

  // Artist methods
  artist_addTags(qs: ArtistAddTags) {
    if (qs.artist === '' || qs.artist === undefined || qs.tags === '' || qs.tags === undefined) {
      return LastFm._sendErr('Missing required parameters');
    }
    return this._post({ ...qs, method: 'artist.addTags' });
  }

  artist_getCorrection(qs: ArtistGetCorrection) {
    if (qs.artist === '' || qs.artist === undefined) {
      return LastFm._sendErr('Missing Artist');
    }
    return this._get<ArtistGetCorrectionRes>({ ...qs, method: 'artist.getCorrection' }, 'corrections');
  }

  artist_getInfo(qs: ArtistGetInfo) {
    if (
      !qs ||
      (((qs as NamedArtist).artist === '' || (qs as NamedArtist).artist === undefined) &&
        ((qs as MBIDArtist).mbid === '' || (qs as MBIDArtist).mbid === undefined))
    ) {
      return LastFm._sendErr('Missing both artist and mbid');
    }

    return this._get<ArtistGetInfoRes>({ ...qs, method: 'artist.getInfo', autocorrect: 1 }, 'artist');
  }

  artist_getSimilar(qs: ArtistGetSimilar) {
    if (
      !qs ||
      (((qs as NamedArtist).artist === '' || (qs as NamedArtist).artist === undefined) &&
        ((qs as MBIDArtist).mbid === '' || (qs as MBIDArtist).mbid === undefined))
    ) {
      return LastFm._sendErr('Missing both artist and mbid');
    }
    return this._get<ArtistGetSimilarRes>(
      { ...qs, method: 'artist.getSimilar', autocorrect: 1 },
      'similarartists',
      qs.callback,
    );
  }

  artist_getTags(qs: ArtistGetTags) {
    if (
      (((qs as NamedArtist).artist === '' || (qs as NamedArtist).artist === undefined) &&
        ((qs as MBIDArtist).mbid === '' || (qs as MBIDArtist).mbid === undefined)) ||
      qs.user === '' ||
      qs.user === undefined
    ) {
      return LastFm._sendErr('Missing both artist and mbid');
    }
    return this._get<ArtistGetTagsRes>({ ...qs, method: 'artist.getTags', autocorrect: 1 }, 'tags');
  }

  artist_getTopAlbums(qs: ArtistGetTopAlbums) {
    if (
      !qs ||
      (((qs as NamedArtist).artist === '' || (qs as NamedArtist).artist === undefined) &&
        ((qs as MBIDArtist).mbid === '' || (qs as MBIDArtist).mbid === undefined))
    ) {
      return LastFm._sendErr('Missing both artist and mbid');
    }
    return this._get<ArtistGetTopAlbumsRes>(
      { ...qs, method: 'artist.getTopAlbums', autocorrect: 1 },
      'topalbums',
      qs.callback,
    );
  }

  artist_getTopTags(qs: ArtistGetTopTags) {
    if (
      !qs ||
      (((qs as NamedArtist).artist === '' || (qs as NamedArtist).artist === undefined) &&
        ((qs as MBIDArtist).mbid === '' || (qs as MBIDArtist).mbid === undefined))
    ) {
      return LastFm._sendErr('Missing both artist and mbid');
    }
    return this._get<ArtistGetTopTagsRes>(
      { ...qs, method: 'artist.getTopTags', autocorrect: 1 },
      'toptags',
      qs.callback,
    );
  }

  artist_getTopTracks(qs: ArtistGetTopTracks) {
    if (
      !qs ||
      (((qs as NamedArtist).artist === '' || (qs as NamedArtist).artist === undefined) &&
        ((qs as MBIDArtist).mbid === '' || (qs as MBIDArtist).mbid === undefined))
    ) {
      return LastFm._sendErr('Missing both artist and mbid');
    }
    return this._get<ArtistGetTopTracksRes>(
      { ...qs, method: 'artist.getTopTracks', autocorrect: 1 },
      'toptracks',
      qs.callback,
    );
  }

  artist_removeTag(qs: ArtistRemoveTag) {
    if (qs.artist === '' || qs.artist === undefined || qs.tag === '' || qs.tag === undefined) {
      return LastFm._sendErr('Missing required parameters');
    }
    return this._post({ ...qs, method: 'artist.removeTag' });
  }

  artist_search(qs: ArtistSearch) {
    if (qs.artist === '' || qs.artist === undefined) {
      return LastFm._sendErr('Missing artist to search');
    }
    return this._get<ArtistSearchRes>({ ...qs, method: 'artist.search', autocorrect: 1 }, 'results');
  }

  // Chart Methods
  chart_getTopArtists(opt) {
    const qs = opt || {};
    return this._get({ ...qs, method: 'chart.getTopArtists', autocorrect: 1 }, 'artists');
  }

  chart_getTopTags(opt) {
    const qs = opt || {};
    return this._get({ ...qs, method: 'chart.getTopTags', autocorrect: 1 }, 'tags');
  }

  chart_getTopTracks(opt) {
    const qs = opt || {};
    return this._get({ ...qs, method: 'chart.getTopTracks', autocorrect: 1 }, 'tracks');
  }

  // Geo Methods
  geo_getTopArtists(opt) {
    const qs = opt || {};
    if (qs.country === '' || qs.country === undefined) {
      return LastFm._sendErr('Missing country');
    }
    return this._get({ ...qs, method: 'geo.getTopArtists', autocorrect: 1 }, 'topartists');
  }

  geo_getTopTracks(opt) {
    const qs = opt || {};
    if (qs.country === '' || qs.country === undefined) {
      return LastFm._sendErr('Missing country');
    }
    return this._get({ ...qs, method: 'geo.getTopTracks', autocorrect: 1 }, 'tracks');
  }

  // Library Methods
  library_getArtists(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      return LastFm._sendErr('Missing username');
    }
    return this._get({ ...qs, method: 'library.getArtists', autocorrect: 1 }, 'artists');
  }

  // Tag Methods
  tag_getInfo(opt) {
    const qs = opt || {};
    if (qs.tag === '' || qs.tag === undefined) {
      return LastFm._sendErr('No tag given');
    }
    qs.method = 'tag.getInfo';
    return this._get(qs, 'tag');
  }

  tag_getSimilar(opt) {
    const qs = opt || {};
    if (qs.tag === '' || qs.tag === undefined) {
      return LastFm._sendErr('No tag given');
    }
    qs.method = 'tag.getSimilar';
    return this._get(qs, 'similartags');
  }

  tag_getTopAlbums(opt) {
    const qs = opt || {};
    if (qs.tag === '' || qs.tag === undefined) {
      return LastFm._sendErr('No tag given');
    }
    qs.method = 'tag.getTopAlbums';
    return this._get(qs, 'albums');
  }

  tag_getTopArtists(opt) {
    const qs = opt || {};
    if (qs.tag === '' || qs.tag === undefined) {
      return LastFm._sendErr('No tag given');
    }
    qs.method = 'tag.getTopArtists';
    return this._get(qs, 'topartists');
  }

  tag_getTopTags(opt) {
    const qs = opt || {};
    qs.method = 'tag.getTopTags';
    return this._get(qs, 'toptags');
  }

  tag_getTopTracks(opt) {
    const qs = opt || {};
    if (qs.tag === '' || qs.tag === undefined) {
      return LastFm._sendErr('No tag given');
    }
    qs.method = 'tag.getTopTracks';
    return this._get(qs, 'tracks');
  }

  tag_getWeeklyChartList(opt) {
    const qs = opt || {};
    if (qs.tag === '' || qs.tag === undefined) {
      return LastFm._sendErr('No tag given');
    }
    qs.method = 'tag.getWeeklyChartList';
    return this._get(qs, 'weeklychartlist');
  }

  // Track methods
  track_addTags(opt) {
    const qs = opt || {};
    if (
      qs.artist === '' ||
      qs.artist === undefined ||
      qs.track === '' ||
      qs.track === undefined ||
      qs.tags === '' ||
      qs.tags === undefined
    ) {
      return LastFm._sendErr('Missing required params');
    }
    qs.method = 'track.addTags';
    return this._post(qs);
  }

  track_getCorrection(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined || qs.track === '' || qs.track === undefined) {
      return LastFm._sendErr('Missing required params');
    }
    qs.method = 'track.getCorrection';
    return this._get(qs, 'corrections');
  }

  track_getInfo(opt) {
    const qs = opt || {};
    if (
      (qs.artist === '' || qs.artist === undefined || qs.track === '' || qs.track === undefined) &&
      (qs.mbid === '' || qs.mbid === undefined)
    ) {
      return LastFm._sendErr('Missing required params');
    }
    return this._get({ ...qs, method: 'track.getInfo', autocorrect: 1 }, 'track');
  }

  track_getSimilar(opt) {
    const qs = opt || {};
    if (
      (qs.artist === '' || qs.artist === undefined || qs.track === '' || qs.track === undefined) &&
      (qs.mbid === '' || qs.mbid === undefined)
    ) {
      return LastFm._sendErr('Missing both artist and mbid');
    }
    return this._get({ ...qs, method: 'track.getSimilar', autocorrect: 1 }, 'similartracks');
  }

  track_getTags(opt) {
    const qs = opt || {};
    if (
      qs.user === '' ||
      qs.user === undefined ||
      ((qs.artist === '' || qs.artist === undefined || qs.track === '' || qs.track === undefined) &&
        (qs.mbid === '' || qs.mbid === undefined))
    ) {
      return LastFm._sendErr('Missing required params');
    }
    return this._get({ ...qs, method: 'track.getTags', autocorrect: 1 }, 'tags');
  }

  track_getTopTags(opt) {
    const qs = opt || {};
    if (
      (qs.artist === '' || qs.artist === undefined || qs.track === '' || qs.track === undefined) &&
      (qs.mbid === '' || qs.mbid === undefined)
    ) {
      return LastFm._sendErr('Missing required params');
    }
    return this._get({ ...qs, method: 'track.getTopTags', autocorrect: 1 }, 'toptags');
  }

  track_love(opt: PostRequest & { artist: string; track: string }) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined || qs.track === '' || qs.track === undefined) {
      return LastFm._sendErr('Missing required params');
    }
    return this._post({ ...qs, method: 'track.love' });
  }

  track_removeTag(opt) {
    const qs = opt || {};
    if (
      qs.artist === '' ||
      qs.artist === undefined ||
      qs.track === '' ||
      qs.track === undefined ||
      qs.tag === '' ||
      qs.tag === undefined
    ) {
      return LastFm._sendErr('Missing required params');
    }
    qs.method = 'track.removeTag';
    return this._post(qs);
  }

  track_scrobble(opt) {
    const qs = opt || {};
    if (
      qs.artist === '' ||
      qs.artist === undefined ||
      qs.track === '' ||
      qs.track === undefined ||
      qs.timestamp === '' ||
      qs.timestamp === undefined
    ) {
      return LastFm._sendErr('Missing required params');
    }
    qs.method = 'track.scrobble';
    return this._post(qs);
  }

  track_search(opt) {
    const qs = opt || {};
    if (qs.track === '' || qs.track === undefined) {
      return LastFm._sendErr('Missing track for search');
    }
    return this._get({ ...qs, method: 'track.search', autocorrect: 1 }, 'results');
  }

  track_unlove(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined || qs.track === '' || qs.track === undefined) {
      return LastFm._sendErr('Missing track or artist');
    }
    qs.method = 'track.unlove';
    return this._post(qs);
  }

  track_updateNowPlaying(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined || qs.track === '' || qs.track === undefined) {
      return LastFm._sendErr('Missing track or artist');
    }
    qs.method = 'track.updateNowPlaying';
    return this._post(qs);
  }

  // User Methods
  user_getArtistTracks(opt) {
    const qs = opt || {};
    if (qs.artist === '' || qs.artist === undefined) {
      return LastFm._sendErr('Missing artist');
    }
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return LastFm._sendErr('Missing user');
      }
      qs.user = this.username;
    }
    qs.method = 'user.getArtistTracks';
    return this._get(qs, 'artisttracks');
  }

  user_getFriends(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return LastFm._sendErr('Missing user');
      }
      qs.user = this.username;
    }
    qs.method = 'user.getFriends';
    return this._get(qs, 'friends');
  }

  user_getInfo(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return LastFm._sendErr('Missing user');
      }
      qs.user = this.username;
    }
    qs.method = 'user.getInfo';
    return this._get(qs, 'user');
  }

  user_getLovedTracks(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return LastFm._sendErr('Missing user');
      }
      qs.user = this.username;
    }
    qs.method = 'user.getLovedTracks';
    return this._get(qs, 'lovedtracks');
  }

  user_getPersonalTags(opt) {
    const qs = opt || {};
    if (qs.tag === '' || qs.tag === undefined) {
      return LastFm._sendErr('Missing tag');
    }
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return LastFm._sendErr('Missing user');
      }
      qs.user = this.username;
    }
    qs.method = 'user.getPersonalTags';
    return this._get(qs, 'taggings');
  }

  user_getRecentTracks(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return LastFm._sendErr('Missing user');
      }
      qs.user = this.username;
    }
    qs.method = 'user.getRecentTracks';
    return this._get(qs, 'recenttracks');
  }

  user_getTopAlbums(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return LastFm._sendErr('Missing user');
      }
      qs.user = this.username;
    }
    qs.method = 'user.getTopAlbums';
    return this._get(qs, 'topalbums');
  }

  user_getTopArtists(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return LastFm._sendErr('Missing user');
      }
      qs.user = this.username;
    }
    qs.method = 'user.getTopArtists';
    return this._get(qs, 'topartists');
  }

  user_getTopTags(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return LastFm._sendErr('Missing user');
      }
      qs.user = this.username;
    }
    qs.method = 'user.getTopTags';
    return this._get(qs, 'toptags');
  }

  user_getTopTracks(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return LastFm._sendErr('Missing user');
      }
      qs.user = this.username;
    }
    qs.method = 'user.getTopTracks';
    return this._get(qs, 'toptracks');
  }

  user_getWeeklyAlbumChart(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return LastFm._sendErr('Missing user');
      }
      qs.user = this.username;
    }
    qs.method = 'user.getWeeklyAlbumChart';
    return this._get(qs, 'weeklyalbumchart');
  }

  user_getWeeklyArtistChart(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return LastFm._sendErr('Missing user');
      }
      qs.user = this.username;
    }
    qs.method = 'user.getWeeklyArtistChart';
    return this._get(qs, 'weeklyartistchart');
  }

  user_getWeeklyChartList(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return LastFm._sendErr('Missing user');
      }
      qs.user = this.username;
    }
    qs.method = 'user.getWeeklyChartList';
    return this._get(qs, 'weeklychartlist');
  }

  user_getWeeklyTrackChart(opt) {
    const qs = opt || {};
    if (qs.user === '' || qs.user === undefined) {
      if (this.username === '' || this.username === undefined) {
        return LastFm._sendErr('Missing user');
      }
      qs.user = this.username;
    }
    qs.method = 'user.getWeeklyTrackChart';
    return this._get(qs, 'weeklytrackchart');
  }
}
