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

lfm.chart_getTopArtists({
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.chart_getTopArtists({
	limit: 5
}).then(printRes, printError);

lfm.chart_getTopTags({
	limit: 5,
	page: 2,
	callback(res) {
		console.log(res);
	}
});

lfm.chart_getTopTags({
	limit: 5,
	page: 2
}).then(printRes, printError);

lfm.chart_getTopTracks({
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.chart_getTopTracks({
	limit: 5
}).then(printRes).catch(printError);