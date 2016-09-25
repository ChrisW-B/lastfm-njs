var lastfm = require("../lib");
var config = require("./config");
var lfm = new lastfm({
	apiKey: config.key,
	apiSecret: config.secret,
	username: config.username,
	password: config.password,
	debug: true
});

lfm.getSessionKey(function(res) {
	// opt = {
	// 	artist: artist, //req
	// 	album: album, //req
	// 	tags: tags, //req, max: 10, comma separated list
	// }
	// console.log(res);
	// if (res.success) {
	// 	lfm.addAlbumTags({
	// 		artist: 'Oh Pep!',
	// 		album: 'Living',
	// 		tags: 'peppy, folk',
	// 		callback: function(res) {
	// 			console.log("result is: " + res);
	// 		}
	// 	});
	// 	lfm.removeAlbumTags({
	// 		artist: 'Oh Pep!',
	// 		album: 'Living',
	// 		tag: 'peppy',
	// 		callback: function(res) {
	// 			console.log("result is: " + res);
	// 		}
	// 	});
	// }
});

// lfm.getAlbumInfo({
// 	artist: 'PWR BTTM',
// 	album: 'Ugly Cherries',
// 	username: 'Christo27',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.getAlbumTags({
// 	artist: 'Pale Honey',
// 	album: 'Pale Honey',
// 	username: 'Christo27',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });

// lfm.getAlbumTopTags({
// 	artist: 'Pale Honey',
// 	album: 'Pale Honey',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.findAlbum({
// 	album: 'Sprinter',
// 	page: 2,
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res.results.albummatches);
// 	}
// });