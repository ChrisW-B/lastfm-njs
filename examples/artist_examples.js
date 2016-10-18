const lastfm = require('../lib');
const config = require('./config');
const lfm = new lastfm({
	apiKey: config.key,
	apiSecret: config.secret,
	username: config.username,
	password: config.password
});

const printRes = function(res) {
	console.log(res);
};
const printError = function(error) {
	console.error('ERROR: ' + JSON.stringify(error));
};

lfm.auth_getMobileSession(function(res) {
	if (res.success) {
		lfm.artist_addTags({
			artist: 'Lucy Dacus',
			tags: 'folk,dacus,music',
			callback(res) {
				console.log('done! result is: ' + JSON.stringify(res));
			}
		});
		lfm.artist_removeTag({
			artist: 'Lucy Dacus',
			tag: 'dacus',
			callback(res) {
				console.log('done! result is: ' + res);
			}
		});
	}
});

lfm.auth_getMobileSession().then(function() {
	lfm.artist_addTags({
		artist: 'Lucy Dacus',
		tags: 'folk,dacus,music'
	}).then(printRes);
	lfm.artist_removeTag({
		artist: 'Lucy Dacus',
		tag: 'music'
	}).then(printRes, printError);
}).catch(printError);

lfm.artist_getCorrection({
	artist: 'Guns and Roses',
	callback(res) {
		console.log(res);
	}
});

lfm.artist_getCorrection({
	artist: 'Guns and Roses'
}).then(printRes).catch(printError);

lfm.artist_getInfo({
	artist: 'Thao & The Get Down Stay Down',
	username: 'Christo27',
	callback: function(res) {
		console.log(res);
	}
});

lfm.artist_getInfo({
	artist: 'Thao & The Get Down Stay Down',
	username: 'Christo27',
}).then(printRes).catch(printError);

lfm.artist_getSimilar({
	artist: 'Waxahatchee',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.artist_getSimilar({
	artist: 'Waxahatchee',
	limit: 5
}).then(printRes).catch(printError);

lfm.artist_getTags({
	artist: 'Lucy Dacus',
	user: 'Christo27',
	callback(res) {
		console.log(res);
	}
});

lfm.artist_getTags({
	artist: 'Lucy Dacus',
	user: 'Christo27'
}).then(printRes).catch(printError);

lfm.artist_getTopAlbums({
	artist: 'A Camp',
	limit: 2,
	callback(res) {
		console.log(res);
	}
});

lfm.artist_getTopAlbums({
	artist: 'A Camp',
	limit: 2
}).then(printRes, printError);

lfm.artist_getTopTags({
	artist: 'Broken Social Scene',
	callback(res) {
		console.log(res);
	}
});

lfm.artist_getTopTags({
	artist: 'Broken Social Scene'
}).then(printRes, printError);

lfm.artist_getTopTracks({
	artist: 'Shamir',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.artist_getTopTracks({
	artist: 'Shamir',
	limit: 5
}).then(printRes, printError);

lfm.artist_search({
	artist: 'Stars',
	limit: 3,
	callback(res) {
		console.log(res);
	}
});

lfm.artist_search({
	artist: 'Stars',
	limit: 3
}).then(printRes, printError);