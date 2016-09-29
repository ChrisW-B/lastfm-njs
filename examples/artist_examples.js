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
		lfm.artist_addTags({
			artist: 'Lucy Dacus',
			tags: 'folk,dacus',
			callback(res) {
				console.log("done! result is: " + res);
			}
		});
		lfm.artist_removeTag({
			artist: 'Lucy Dacus',
			tag: 'dacus',
			callback(res) {
				console.log("done! result is: " + res);
			}
		});
	}
});

lfm.artist_getCorrection({
	artist: 'Guns and Roses',
	callback(res) {
		console.log(res);
	}
});

lfm.artist_getInfo({
	artist: 'Thao & The Get Down Stay Down',
	username: 'Christo27',
	callback function_name(res) {
		console.log(res);
	}
});

lfm.artist_getSimilar({
	artist: 'Waxahatchee',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.artist_getTags({
	artist: 'Lucy Dacus',
	user: 'Christo27',
	callback(res) {
		console.log(res);
	}
});

lfm.artist_getTopAlbums({
	artist: 'A Camp',
	limit: 2,
	callback(res) {
		console.log(res);
	}
});

lfm.artist_getTopTags({
	artist: 'Broken Social Scene',
	callback(res) {
		console.log(res);
	}
});

lfm.artist_getTopTracks({
	artist: 'Shamir',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.artist_search({
	artist: 'Stars',
	limit: 3,
	callback(res) {
		console.log(res);
	}
});