var lastfm = require("../lib");
var config = require("./config");
var lfm = new lastfm({
	apiKey: config.key,
	apiSecret: config.secret,
	username: config.username
});

lfm.chart_getTopArtists({
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.chart_getTopTags({
	limit: 5,
	page: 2,
	callback(res) {
		console.log(res);
	}
});

lfm.chart_getTopTracks({
	limit: 5,
	callback(res) {
		console.log(res);
	}
});