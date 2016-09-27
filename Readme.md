# LastFM-njs
A fully featured interface for Node and the Last.FM api

The full Last.FM API description can be found [here](http://www.last.fm/api)

You'll need an API key from [Create API Account](http://www.last.fm/api/account/create)

You can install using `npm install --save lastfm-njs`

Then you can set up like so, where username is a default username:
```js
var lastfm = require("lastfm-njs");
var config = require("./config");
var lfm = new lastfm({
    apiKey: config.key,
    apiSecret: config.secret,
    username: config.username
});
```

If a method requires writing to an account, then you also need password

```js
var lfm = new lastfm({
    apiKey: config.key,
    apiSecret: config.secret,
    username: config.username,
    password: config.password
});
```

After this, you can use any of the methods

## Documentation
- [Authentication Methods](#authentication-methods)
- [Album Methods](#album-methods)
- [Artist Methods](#artist-methods)
- [Geo Methods](#geo-methods)
- [Library Methods](#library-methods)
- [Tag Methods](#tag-methods)
- [Track Methods](#track-methods)
- [User Methods](#user-methods)

### Authentication
[Last.FM Documentation](http://www.last.fm/api/show/auth.getMobileSession)

**A username and password is required**

`auth_getMobileSession(callback);`

where callback is a function which either returns 
```js
{
    success: true,
    key: 'XXX'
}
```
or
```js
{
    success: false,
    error: [lastFMError]
}
```

### Album Methods
[Examples](../blob/master/examples/album_examples.js)
#### Add Tags*
[Last.FM Documentation](http://www.last.fm/api/show/album.addTags)

`album_addTags(opt)`, where
```js
    opt = {
        artist: artist, //req
        album: album, //req
        tags: tags, //req, max: 10, comma separated list
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

_*Requires Authentication_
#### Get Info
[Last.FM Documentation](https://www.last.fm/api/show/album.getInfo)

`album_getInfo(opt)`, where
```js
    opt = {
        artist: artist, //req unless mbid
        album: album, //req unless mbid
        mbid: mbid, //opt
        lang: lang, //opt
        username: username //opt
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Tags
[Last.FM Documentation](https://www.last.fm/api/show/album.getTags)

`album_getTags(opt)`, where
```js
     opt = {
        artist: artist, //req unless mbid
        album: album, //req unless mbid
        username: username, //req
        mbid: mbid //opt
        callback: callback
     }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Tags
[Last.FM Documentation](https://www.last.fm/api/show/album.getTopTags)

`album_getTopTags(opt)`, where
```js
    opt = {
        artist: artist, //req unless mbid
        album: album, //req unless mbid
        mbid: mbid //opt
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Remove Tag*
[Last.FM Documentation](http://www.last.fm/api/show/album.removeTag)

`album_removeTag(opt)`, where
```js
    opt = {
        artist: artist, //req
        album: album, //req
        tag: tag, //req, single tag to remove
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

_*Requires Authentication_
#### Album Search
[Last.FM Documentation](https://www.last.fm/api/show/album.search)

`album_getTopTags(opt)`, where
```js
    opt = {
        album: album, //req
        limit: limit, //opt, defaults to 30
        page: page //opt, defaults to 1
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

## Artist
[Examples](../blob/master/examples/artist_examples.js)

#### Add Tags*
[Last.FM Documentation](http://www.last.fm/api/show/artist.addTags)

`artist_addTags(opt)`, where
```js
    opt = {
        artist: artist //req
        tags: tags, //req, max 10, comma separated
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

_*Requires Authentication_
#### Get Correction
[Last.FM Documentation](http://www.last.fm/api/show/artist.getCorrection)

`artist_getCorrection(opt)`, where
```js
    opt = {
        artist: artist, //req
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Info
[Last.FM Documentation](http://www.last.fm/api/show/artist.getInfo)

`artist_getInfo(opt)`, where
```js
    opt = {
        artist: artist, //req unless mbid
        mbid: mbid, //opt
        username: username, //opt
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Similar
[Last.FM Documentation](http://www.last.fm/api/show/artist.getSimilar)

`artist_getSimilar(opt)`, where
```js
    opt = {
        artist: artist, //req unless mbid
        mbid: mbid, //opt
        limit: limit, //opt
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Tags
[Last.FM Documentation](http://www.last.fm/api/show/artist.getTags)

`artist_getTags(opt)`, where
```js
    opt = {
        artist: artist, //req unless mbid
        user: username, //req
        mbid: mbid, //opt
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Albums
[Last.FM Documentation](http://www.last.fm/api/show/artist.getTopAlbums)

`artist_getTopAlbums(opt)`, where
```js
    opt = {
        artist: artist, //req unless mbid
        mbid: mbid, //opt
        page: page, //opt, default is 50
        limit: limit, //opt, default is 1
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Tags
[Last.FM Documentation](http://www.last.fm/api/show/artist.getTopTags)

`artist_getTopTags(opt)`, where
```js
    opt = {
        artist: artist, //req unless mbid
        mbid: mbid, //opt
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Tracks
[Last.FM Documentation](http://www.last.fm/api/show/artist.getTopTracks)

`artist_getTopTracks(opt)`, where
```js
    opt = {
        artist: artist, //req unless mbid
        mbid: mbid, //opt
        page: page //opt, default is 1
        limit: limit //opt, default is 50
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Remove Tag*
[Last.FM Documentation](http://www.last.fm/api/show/artist.removeTag)

`artist_removeTag(opt)`, where
```js
    opt = {
        artist: artist //req
        tag: tag, //req, 1 tag to be removed
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

_*Requires Authentication_
#### Search
[Last.FM Documentation](http://www.last.fm/api/show/artist.search)

`artist_search(opt)`, where
```js
    opt = {
        artist: artist, //req unless mbid
        page: page //opt, default is 1
        limit: limit //opt, default is 50
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

### Chart Methods
[Examples](../blob/master/examples/chart_examples.js)

#### Get Top Artists
[Last.FM Documentation](http://www.last.fm/api/show/chart.getTopArtists)

`chart_getTopArtists(opt)`, where
```js
    opt = {
        page: page //opt, default is 1
        limit: limit //opt, default is 50
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Tags
[Last.FM Documentation](http://www.last.fm/api/show/chart.getTopTags)

`chart_getTopTags(opt)`, where
```js
    opt = {
        page: page //opt, default is 1
        limit: limit //opt, default is 50
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Tracks
[Last.FM Documentation](http://www.last.fm/api/show/chart.getTopTracks)

`chart_getTopTracks(opt)`, where
```js
    opt = {
        page: page //opt, default is 1
        limit: limit //opt, default is 50
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

### Geo Methods
[Examples](../blob/master/examples/geo_examples.js)

#### Get Top Artists
[Last.FM Documentation](http://www.last.fm/api/show/geo.getTopArtists)

`geo_getTopArtists(opt)`, where
```js
    opt = {
        country: country //req, ISO 3166-1 format
        page: page //opt, default is 1
        limit: limit //opt, default is 50
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Tracks
[Last.FM Documentation](http://www.last.fm/api/show/geo.getTopTracks)

`geo_getTopTracks(opt)`, where
```js
    opt = {
        country: country //req, ISO 3166-1 format
        page: page //opt, default is 1
        limit: limit //opt, default is 50
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

### Library Methods
[Examples](../blob/master/examples/library_examples.js)

#### Get Artists
[Last.FM Documentation](http://www.last.fm/api/show/library.getArtists)

`library_getArtists(opt)`, where
```js
    opt = {
        user: username //req
        page: page //opt, default is 1
        limit: limit //opt, default is 50
        callback: callback
    }

```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

### Tag Methods
[Examples](../blob/master/examples/Library_examples.js)

#### Get Info
[Last.FM Documentation](http://www.last.fm/api/show/tag.getInfo)

`tag_getInfo(opt)`, where
```js
    opt = {
        tag: tag //req
        lang: lang //opt
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Similar
[Last.FM Documentation](http://www.last.fm/api/show/tag.getSimilar)

`tag_getSimilar(opt)`, where
```js
    opt = {
        tag: tag //req
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Albums
[Last.FM Documentation](http://www.last.fm/api/show/tag.getTopAlbums)

`tag_getTopAlbums(opt)`, where
```js
    opt = {
        tag: tag //req
        limit: limit //opt, default is 50
        page: page //opt, default is 1
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Artists
[Last.FM Documentation](http://www.last.fm/api/show/tag.getTopArtists)

`tag_getTopArtists(opt)`, where
```js
    opt = {
        tag: tag //req
        limit: limit //opt, default is 50
        page: page //opt, default is 1
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Tags
[Last.FM Documentation](http://www.last.fm/api/show/tag.getTopTags)

`tag_getTopTags(opt)`, where
```js
    opt = {
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Tracks
[Last.FM Documentation](http://www.last.fm/api/show/tag.getTopTracks)

`tag_getTopTracks(opt)`, where
```js
    opt = {
        tag: tag //req
        limit: limit //opt, defaults to 50
        page: page //opt, defaults to 1
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Weekly Chart List
[Last.FM Documentation](http://www.last.fm/api/show/tag.getWeeklyChartList)

`tag_getWeeklyChartList(opt)`, where
```js
    opt = {
        tag: tag //req
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

### Track Methods
[Examples](../blob/master/examples/track_examples.js)

#### Add Tags*
[Last.FM Documentation](http://www.last.fm/api/show/track.addTags)

`track_addTags(opt)`, where
```js
    opt = {
        artist: artist //req
        track: track //req
        tags: tags //req, max: 10
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

_*Requires Authentication_
#### Get Correction
[Last.FM Documentation](http://www.last.fm/api/show/track.getCorrection)

`track_getCorrection(opt)`, where
```js
    opt = {
        artist: artist, //req
        track: track //req
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Info
[Last.FM Documentation](http://www.last.fm/api/show/track.getInfo)

`track_getInfo(opt)`, where
```js
    opt = {
        artist: artist, //req unless mbid
        track: track, //req unless mbid
        mbid: mbid, //opt
        username: username //opt
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Similar
[Last.FM Documentation](http://www.last.fm/api/show/track.getSimilar)

`track_getSimilar(opt)`, where
```js
    opt = {
        artist: artist, //req unless mbid
        track: track, //req unless mbid
        mbid: mbid, //opt
        limit: limit, //opt
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Tags
[Last.FM Documentation](http://www.last.fm/api/show/track.getTags)

`track_getTags(opt)`, where
```js
    opt = {
        artist: artist, //req unless mbid
        track: track, //req unless mbid
        username: username, //req
        mbid: mbid //opt
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Tags
[Last.FM Documentation](http://www.last.fm/api/show/track.getTopTags)

`track_getTopTags(opt)`, where
```js
    opt = {
        artist: artist, //req unless mbid
        track: track, //req unless mbid
        mbid: mbid //opt
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Love Track*
[Last.FM Documentation](http://www.last.fm/api/show/track.love)

`track_love(opt)`, where
```js
    opt = {
        artist: artist, //req unless mbid
        track: track, //req unless mbid
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

_*Requires Authentication_

#### Remove Tag*
[Last.FM Documentation](http://www.last.fm/api/show/track.removeTag)

`track_removeTag(opt)`, where
```js
    opt = {
        artist: artist, //req
        track: track, //req
        tag: tag, //req, single tag to remove
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

_*Requires Authentication_

#### Scrobble*
[Last.FM Documentation](http://www.last.fm/api/show/track.scrobble)

`track_scrobble(opt)`, where
```js
    opt = {
        artist: artist[i], //req
        track: track[i], //req
        timestamp: timestamp[i] //req
        album: album[i] //opt
        context: context[i] //opt
        streamId: streamId[i] //opt
        chosenByUser: chosenByUser[i] //opt
        trackNumber: trackNumber[i] //opt
        mbid: mbid[i] //opt
        albumArtist: albumArtist[i] //opt
        duration: duration[i] //opt
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

_*Requires Authentication_

#### Search
[Last.FM Documentation](http://www.last.fm/api/show/track.search)

`track_search(opt)`, where
```js
    opt = {
        track: track, //req
        artist: artist, //opt
        limit: limit, //opt, defaults to 30
        page: page //opt, defaults to 1
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Unlove*
[Last.FM Documentation](http://www.last.fm/api/show/track.unlove)

`track_unlove(opt)`, where
```js
    opt = {
        track: track, //req
        artist: artist, //req
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

_*Requires Authentication_

#### Update Now Playing*
[Last.FM Documentation](http://www.last.fm/api/show/track.updateNowPlaying)

`track_updateNowPlaying(opt)`, where
```js
    opt = {
        artist: artist, //req
        track: track, //req
        album: album //opt
        context: context //opt
        trackNumber: trackNumber //opt
        mbid: mbid //opt
        albumArtist: albumArtist //opt
        duration: duration //opt
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

_*Requires Authentication_

### User Methods
[Examples](../blob/master/examples/user_examples.js)

#### Get Artist Tracks
[Last.FM Documentation](http://www.last.fm/api/show/user.getArtistTracks)

`user_getArtistTracks(opt)`, where
```js
    opt = {
        user: username //req
        artist: artist //req
        startTimestamp: startTimestamp //opt defaults to all time
        page: page //opt, default is 1
        endTimestamp: endTimestamp //opt defaults to all time
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Friends
[Last.FM Documentation](http://www.last.fm/api/show/user.getFriends)

`user_getFriends(opt)`, where
```js
    opt = {
        user: username //req
        recentTracks: recentTracks //opt, true|false
        limit: limit //opt defaults to 50
        page: page //opt, default is 1
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Info
[Last.FM Documentation](http://www.last.fm/api/show/user.getInfo)

`user_getInfo(opt)`, where
```js
    opt = {
        user: username //opt, defaults to init user
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Loved Tracks
[Last.FM Documentation](http://www.last.fm/api/show/user.getLovedTracks)

`user_getLovedTracks(opt)`, where
```js
    opt = {
        user: username //req
        limit: limit //opt, default is 50
        page: page //opt, default is 1
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Personal Tags
[Last.FM Documentation](http://www.last.fm/api/show/user.getPersonalTags)

`user_getPersonalTags(opt)`, where
```js
    opt = {
        user: username //req
        tag: tag //req
        taggingtype: artist|album|track //req
        limit: limit //opt, default is 50
        page: page //opt, default is 1
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Recent Tracks
[Last.FM Documentation](http://www.last.fm/api/show/user.getRecentTracks)

`user_getRecentTracks(opt)`, where
```js
    opt = {
        user: username //req
        from: startTime //opt
        extended: 0|1 //opt
        to: endTime //opt
        limit: limit //opt, default is 50
        page: page //opt, default is 1
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Albums
[Last.FM Documentation](http://www.last.fm/api/show/user.getTopAlbums)

`user_getTopAlbums(opt)`, where
```js
    opt = {
        user: username //req
        period: overall|7day|1month|3month|6month|12month //opt, default is overall
        limit: limit //opt, default is 50
        page: page //opt, default is 1
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Artists
[Last.FM Documentation](http://www.last.fm/api/show/user.getTopArtists)

`user_getTopArtists(opt)`, where
```js
    opt = {
        user: username //req
        period: overall|7day|1month|3month|6month|12month //opt, default is overall
        limit: limit //opt, default is 50
        page: page //opt, default is 1
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Tags
[Last.FM Documentation](http://www.last.fm/api/show/user.getTopTags)

`user_getTopTags(opt)`, where
```js
    opt = {
        user: username //req
        limit: limit //opt, default is 50
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Top Tracks
[Last.FM Documentation](http://www.last.fm/api/show/user.getTopTracks)

`user_getTopTracks(opt)`, where
```js
    opt = {
        user: username //req
        period: overall|7day|1month|3month|6month|12month //opt, default is overall
        limit: limit //opt, default is 50
        page: page //opt, default is 1
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Weekly Album Chart
[Last.FM Documentation](http://www.last.fm/api/show/user.getWeeklyAlbumChart)

`user_getWeeklyAlbumChart(opt)`, where
```js
    opt = {
        user: username //req
        from: startdate //opt, default is overall
        to: enddate //opt, default is 50
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Weekly Artist Chart
[Last.FM Documentation](http://www.last.fm/api/show/user.getWeeklyArtistChart)

`user_getWeeklyArtistChart(opt)`, where
```js
    opt = {
        user: username //req
        from: startdate //opt, default is overall
        to: enddate //opt, default is 50
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Weekly Chart List
[Last.FM Documentation](http://www.last.fm/api/show/user.getWeeklyChartList)

`user_getWeeklyChartList(opt)`, where
```js
    opt = {
        user: username //req
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error

#### Get Weekly Track Chart
[Last.FM Documentation](http://www.last.fm/api/show/user.getWeeklyTrackChart)

`user_getWeeklyTrackChart(opt)`, where
```js
    opt = {
        user: username //req
        from: startdate //opt, default is overall
        to: enddate //opt, default is 50
        callback: callback
    }
```
and callback is a function which receives a single object, containing the Last.FM response and `success: false` if there was an error
