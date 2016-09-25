var lastfm = require("../lib");
var config = require("./config");
var lfm = new lastfm({
	apiKey: config.key,
	apiSecret: config.secret,
	username: config.username,
	password: config.password,
	debug: true
});

lfm.getSessionKey(function(sk) {
	// opt = {
	// 	artist: artist, //req
	// 	album: album, //req
	// 	tags: tags, //req, max: 10, comma separated list
	// 	sessionKey: sessionKey //req
	// }
	lfm.addAlbumTags({
		artist: 'Oh Pep!',
		album: 'Living',
		tags: 'peppy, folk',
		sk: sk,
		callback: function(res) {
			console.log("result is: " + res);
		}
	});
});

// lfm.getAlbumInfo({
// 	artist: 'PWR BTTM',
// 	album: 'Ugly Cherries',
// 	username: 'Christo27',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });