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

lfm.library_getArtists({
	user: 'Christo27',
	limit: 5,
	page: 2,
	callback(res) {
		console.log(res);
	}
});

lfm.library_getArtists({
	user: 'Christo27'
}).then(printRes, printError);