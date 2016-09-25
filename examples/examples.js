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
	if (res.success) {
		// 	lfm.album_addTags({
		// 		artist: 'Oh Pep!',
		// 		album: 'Living',
		// 		tags: 'peppy, folk',
		// 		callback: function(res) {
		// 			console.log("result is: " + res);
		// 		}
		// 	});
		// 	
		// 	lfm.album_removeTag({
		// 		artist: 'Oh Pep!',
		// 		album: 'Living',
		// 		tag: 'peppy',
		// 		callback: function(res) {
		// 			console.log("done! result is: " + res);
		// 		}
		// 	});
		// 	
		// lfm.artist_addTags({
		// 	artist: 'Lucy Dacus',
		// 	tags: 'strange, buttery',
		// 	callback: function(res) {
		// 		console.log("done! result is: " + res);
		// 	}
		// });
		// 
		// lfm.artist_removeTag({
		// 	artist: 'Lucy Dacus',
		// 	tag: 'strange',
		// 	callback: function(res) {
		// 		console.log("done! result is: " + res);
		// 	}
		// });
		// 
	}
});

// lfm.album_getInfo({
// 	artist: 'PWR BTTM',
// 	album: 'Ugly Cherries',
// 	username: 'Christo27',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.album_getTags({
// 	artist: 'Oh Pep!',
// 	album: 'Living',
// 	username: 'Christo27',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
//
// lfm.album_getTopTags({
// 	artist: 'Pale Honey',
// 	album: 'Pale Honey',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.album_search({
// 	album: 'Sprinter',
// 	page: 2,
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res.results.albummatches);
// 	}
// });
// 
// lfm.artist_getCorrection({
// 	artist: 'Guns and Roses',
// 	callback: function(res) {
// 		console.log(res.corrections);
// 	}
// });
// 
// lfm.artist_getInfo({
// 	artist: 'Thao & The Get Down Stay Down',
// 	username: 'Christo27',
// 	callback: function function_name(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.artist_getSimilar({
// 	artist: 'Waxahatchee',
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.artist_getTags({
// 	artist: 'Lucy Dacus',
// 	user: 'Christo27',
// 	callback: function(res) {
// 		console.log(res.tags.tag[0]);
// 	}
// });
// 
// lfm.artist_getTopAlbums({
// 	artist: 'A Camp',
// 	limit: 2,
// 	callback: function(res) {
// 		console.log(res.topalbums.album);
// 	}
// });
// 
// lfm.artist_getTopTags({
// 	artist: 'Broken Social Scene',
// 	callback: function(res) {
// 		console.log(res.toptags.tag);
// 	}
// });
// 
// lfm.artist_getTopTracks({
// 	artist: 'Shamir',
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res.toptracks.track);
// 	}
// });
//
lfm.artist_search({
	artist: 'Stars',
	limit: 3,
	callback: function(res) {
		console.log(res.results.artistmatches);
	}
});