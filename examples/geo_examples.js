var lastfm = require("../lib");
var config = require("./config");
var lfm = new lastfm({
	apiKey: config.key,
	apiSecret: config.secret,
	username: config.username
});

var printRes = function(res) {
	console.log(res);
};
var printError = function(error) {
	console.error("ERROR: " + JSON.stringify(error));
};

lfm.geo_getTopArtists({
	country: 'United States',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.geo_getTopArtists({
	country: 'United States',
	limit: 5
}).then(printRes).catch(printError);

lfm.geo_getTopTracks({
	country: 'Spain',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.geo_getTopTracks({
	country: 'Spain',
	limit: 5
}).then(printRes, printError);