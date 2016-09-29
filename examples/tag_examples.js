var lastfm = require("../lib");
var config = require("./config");
var lfm = new lastfm({
	apiKey: config.key,
	apiSecret: config.secret,
	username: config.username
});

lfm.tag_getInfo({
	tag: 'Indie',
	callback(res) {
		console.log(res);
	}
});

lfm.tag_getSimilar({
	tag: 'Baroque Pop',
	callback(res) {
		console.log(res);
	}
});

lfm.tag_getTopAlbums({
	tag: 'Happy',
	limit: 3,
	callback(res) {
		console.log(res);
	}
});

lfm.tag_getTopArtists({
	tag: 'Indie Rock',
	limit: 3,
	callback(res) {
		console.log(res);
	}
});

lfm.tag_getTopTags({
	callback(res) {
		console.log(res);
	}
});

lfm.tag_getTopTracks({
	tag: 'Musical',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.tag_getTopTracks({
	tag: 'Pop',
	callback(res) {
		console.log(res);
	}
});