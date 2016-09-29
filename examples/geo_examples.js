var lastfm = require("../lib");
var config = require("./config");
var lfm = new lastfm({
	apiKey: config.key,
	apiSecret: config.secret,
	username: config.username
});
lfm.geo_getTopArtists({
	country: 'United States',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.geo_getTopTracks({
	country: 'Spain',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});