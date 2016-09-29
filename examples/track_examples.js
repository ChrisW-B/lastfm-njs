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
		lfm.track_addTags({
			artist: 'Bad Bad Hats',
			track: 'Psychic Reader',
			tags: 'Indie Pop,Female Vocalist',
			callback(res) {
				console.log(res);
			}
		});

		lfm.track_love({
			track: "My Body's Made of Crushed Little Stars",
			artist: 'Mitski',
			callback(res) {
				console.log(res);
			}
		});

		lfm.track_removeTag({
			artist: 'Bad Bad Hats',
			track: 'Psychic Reader',
			tag: 'female vocalist',
			callback(res) {
				console.log(res);
			}
		});

		var now = new Date().getTime();
		lfm.track_scrobble({
			artist: ["Mitski", "Half Waif"],
			track: ["Happy", "Harvest"],
			timestamp: [Math.floor(now / 1000), Math.floor(Date.now() / 1000) - 200],
			callback(res) {
				console.log(res);
			}
		});

		lfm.track_unlove({
			track: "My Body's Made of Crushed Little Stars",
			artist: 'Mitski',
			callback(res) {
				console.log(res);
			}
		});
		lfm.track_updateNowPlaying({
			track: "My Body's Made of Crushed Little Stars",
			artist: 'Mitski',
			callback(res) {
				console.log(res);
			}
		});
	}
});

lfm.track_getCorrection({
	artist: 'Guns and Roses',
	track: 'Mrbrownstone',
	callback(res) {
		console.log(res);
	}
});
lfm.track_getInfo({
	artist: 'Half Waif',
	track: 'All My Armor',
	username: 'Christo27',
	callback(res) {
		console.log(res);
	}
});

lfm.track_getSimilar({
	artist: 'Cher',
	track: 'Believe',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});

lfm.track_getTags({
	artist: 'Carly Rae Jepsen',
	track: 'Call Me Maybe',
	user: 'Christo27',
	callback(res) {
		console.log(res);
	}
});

lfm.track_getTopTags({
	artist: 'Mitski',
	track: 'Your Best American Girl',
	callback(res) {
		console.log(res);
	}
});

lfm.track_search({
	track: 'Cruel World',
	limit: 5,
	callback(res) {
		console.log(res);
	}
});