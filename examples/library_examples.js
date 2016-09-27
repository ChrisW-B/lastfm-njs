var lastfm = require("../lib");
var config = require("./config");
var lfm = new lastfm({
	apiKey: config.key,
	apiSecret: config.secret,
	username: config.username
});
lfm.library_getArtists({
	user: 'Christo27',
	limit: 5,
	page: 2,
	callback: function(res) {
		console.log(res);
	}
});