var lastfm = require("../lib");
var config = require("./config");
var lfm = new lastfm({
	apiKey: config.key,
	apiSecret: config.secret,
	username: config.username,
	password: config.password,
	debug: true
});

lfm.Auth_getMobileSession(function(res) {
	// opt = {
	// 	artist: artist, //req
	// 	album: album, //req
	// 	tags: tags, //req, max: 10, comma separated list
	// }
	// console.log(res);
	// if (res.success) {
	// 	lfm.Album_addTags({
	// 		artist: 'Oh Pep!',
	// 		album: 'Living',
	// 		tags: 'peppy, folk',
	// 		callback: function(res) {
	// 			console.log("result is: " + res);
	// 		}
	// 	});
	// 	lfm.Album_removeTag({
	// 		artist: 'Oh Pep!',
	// 		album: 'Living',
	// 		tag: 'peppy',
	// 		callback: function(res) {
	// 			console.log("result is: " + res);
	// 		}
	// 	});
	// }
});

// lfm.Album_getInfo({
// 	artist: 'PWR BTTM',
// 	album: 'Ugly Cherries',
// 	username: 'Christo27',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.Album_getTags({
// 	artist: 'Oh Pep!',
// 	album: 'Living',
// 	username: 'Christo27',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });

// lfm.Album_getTopTags({
// 	artist: 'Pale Honey',
// 	album: 'Pale Honey',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.Album_search({
// 	album: 'Sprinter',
// 	page: 2,
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res.results.albummatches);
// 	}
// });