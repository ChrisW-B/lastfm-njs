var lastfm = require("../lib");
var config = require("./config");
var lfm = new lastfm({
	apiKey: config.key,
	apiSecret: config.secret,
	username: config.username
});

lfm.user_getArtistTracks({
	user: 'Christo27',
	artist: 'Sylvan Esso',
	callback(res) {
		console.log(res);
	}
});

lfm.user_getFriends({
	user: 'Christo27',
	recenttracks: true,
	callback(res) {
		console.log(res);
	}
});

lfm.user_getInfo({
	//user: 'Christo27', //defaults to authenticated user
	callback(res) {
		console.log(res);
	}
});

lfm.user_getLovedTracks({
	user: 'Christo27',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.user_getPersonalTags({
	user: 'Christo27',
	tag: 'folk',
	taggingtype: 'album',
	callback(res) {
		console.log(res);
	}
});

lfm.user_getRecentTracks({
	user: 'Christo27',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.user_getTopAlbums({
	user: 'Christo27',
	period: '1month',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.user_getTopArtists({
	user: 'Christo27',
	period: '1month',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.user_getTopTags({
	user: 'Christo27',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.user_getTopTracks({
	user: 'Christo27',
	period: '1month',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.user_getWeeklyAlbumChart({
	user: 'Christo27',
	callback(res) {
		console.log(res);
	}
});

lfm.user_getWeeklyArtistChart({
	user: 'Christo27',
	callback(res) {
		console.log(res);
	}
});

lfm.user_getWeeklyChartList({
	user: 'Christo27',
	callback(res) {
		console.log(res);
	}
});

lfm.user_getWeeklyTrackChart({
	user: 'Christo27',
	callback(res) {
		console.log(res);
	}
});