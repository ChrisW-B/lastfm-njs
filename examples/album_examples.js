var lastfm = require("../lib");
var config = require("./config");
var lfm = new lastfm({
	apiKey: config.key,
	apiSecret: config.secret,
	username: config.username,
	password: config.password
});

lfm.auth_getMobileSession(function(res) {
	if (res.success) {
		lfm.album_addTags({
			artist: 'Oh Pep!',
			album: 'Living',
			tags: 'peppy,folk',
			callback: function(res) {
				console.log("result is: " + res);
			}
		});

		lfm.album_removeTag({
			artist: 'Oh Pep!',
			album: 'Living',
			tag: 'peppy',
			callback: function(res) {
				console.log("done! result is: " + res);
			}
		});
	}
});

lfm.album_getInfo({
	artist: 'PWR BTTM',
	album: 'Ugly Cherries',
	username: 'Christo27',
	callback: function(res) {
		console.log(res);
	}
});

lfm.album_getTags({
	artist: 'Oh Pep!',
	album: 'Living',
	username: 'Christo27',
	callback: function(res) {
		console.log(res);
	}
});

lfm.album_getTopTags({
	artist: 'Pale Honey',
	album: 'Pale Honey',
	callback: function(res) {
		console.log(res);
	}
});

lfm.album_search({
	album: 'Sprinter',
	page: 2,
	limit: 5,
	callback: function(res) {
		console.log(res);
	}
});