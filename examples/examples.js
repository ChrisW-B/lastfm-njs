var lastfm = require("../lib");
var config = require("./config");
var lfm = new lastfm({
	apiKey: config.key,
	apiSecret: config.secret,
	username: config.username,
	password: config.password,
	debug: true
});

lfm.auth_getMobileSession(function(res) {
	// opt = {
	// 	artist: artist, //req
	// 	album: album, //req
	// 	tags: tags, //req, max: 10, comma separated list
	// }
	if (res.success) {
		// lfm.album_addTags({
		// 	artist: 'Oh Pep!',
		// 	album: 'Living',
		// 	tags: 'peppy,folk',
		// 	callback: function(res) {
		// 		console.log("result is: " + res);
		// 	}
		// });
		// 	
		// lfm.album_removeTag({
		// 	artist: 'Oh Pep!',
		// 	album: 'Living',
		// 	tag: 'peppy',
		// 	callback: function(res) {
		// 		console.log("done! result is: " + res);
		// 	}
		// });
		//
		// lfm.artist_addTags({
		// 	artist: 'Lucy Dacus',
		// 	tags: 'folk,dacus',
		// 	callback: function(res) {
		// 		console.log("done! result is: " + res);
		// 	}
		// });
		// 
		// lfm.artist_removeTag({
		// 	artist: 'Lucy Dacus',
		// 	tag: 'test',
		// 	callback: function(res) {
		// 		console.log("done! result is: " + res);
		// 	}
		// });
		// 
		// lfm.track_addTags({
		// 	artist: 'Bad Bad Hats',
		// 	track: 'Psychic Reader',
		// 	tags: 'Indie Pop,Female Vocalist',
		// 	callback: function(res) {
		// 		console.log(res);
		// 	}
		// });
		// 
		// lfm.track_love({
		// 	track: "My Body's Made of Crushed Little Stars",
		// 	artist: 'Mitski',
		// 	callback: function(res) {
		// 		console.log(res);
		// 	}
		// });
		// 
		// lfm.track_removeTag({
		// 	artist: 'Bad Bad Hats',
		// 	track: 'Psychic Reader',
		// 	tag: 'female vocalist',
		// 	callback: function(res) {
		// 		console.log(res);
		// 	}
		// });
		// 
		// var now = new Date().getTime();
		// lfm.track_scrobble({
		// 	artist: ["Mitski", "Half Waif"],
		// 	track: ["Happy", "Harvest"],
		// 	timestamp: [Math.floor(now / 1000), Math.floor(Date.now() / 1000) - 200],
		// 	callback: function(res) {
		// 		console.log(res);
		// 	}
		// });
		// 
		// lfm.track_unlove({
		// 	track: "My Body's Made of Crushed Little Stars",
		// 	artist: 'Mitski',
		// 	callback: function(res) {
		// 		console.log(res);
		// 	}
		// });
		// lfm.track_updateNowPlaying({
		// 	track: "My Body's Made of Crushed Little Stars",
		// 	artist: 'Mitski',
		// 	callback: function(res) {
		// 		console.log(res);
		// 	}
		// });
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
// 		console.log(res);
// 	}
// });
// 
// lfm.artist_getCorrection({
// 	artist: 'Guns and Roses',
// 	callback: function(res) {
// 		console.log(res);
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
// 		console.log(res);
// 	}
// });
// 
// lfm.artist_getTopAlbums({
// 	artist: 'A Camp',
// 	limit: 2,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.artist_getTopTags({
// 	artist: 'Broken Social Scene',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.artist_getTopTracks({
// 	artist: 'Shamir',
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
//
// lfm.artist_search({
// 	artist: 'Stars',
// 	limit: 3,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.chart_getTopArtists({
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.chart_getTopTags({
// 	limit: 5,
// 	page: 2,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.chart_getTopTracks({
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.geo_getTopArtists({
// 	country: 'United States',
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.geo_getTopTracks({
// 	country: 'Spain',
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.library_getArtists({
// 	user: 'Christo27',
// 	limit: 5,
// 	page: 2,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.tag_getInfo({
// 	tag: 'Indie',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.tag_getSimilar({
// 	tag: 'Baroque Pop',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.tag_getTopAlbums({
// 	tag: 'Happy',
// 	limit: 3,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.tag_getTopArtists({
// 	tag: 'Indie Rock',
// 	limit: 3,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
//
// lfm.tag_getTopTags({
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.tag_getTopTracks({
// 	tag: 'Musical',
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.tag_getTopTracks({
// 	tag: 'Pop',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
//
// lfm.track_getCorrection({
// 	artist: 'Guns and Roses',
// 	track: 'Mrbrownstone',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// lfm.track_getInfo({
// 	artist: 'Half Waif',
// 	track: 'All My Armor',
// 	username: 'Christo27',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.track_getSimilar({
// 	artist: 'Cher',
// 	track: 'Believe',
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
//
// lfm.track_getTags({
// 	artist: 'Carly Rae Jepsen',
// 	track: 'Call Me Maybe',
// 	user: 'Christo27',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.track_getTopTags({
// 	artist: 'Mitski',
// 	track: 'Your Best American Girl',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
//
// lfm.track_search({
// 	track: 'Cruel World',
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.user_getArtistTracks({
// 	user: 'Christo27',
// 	artist: 'Sylvan Esso',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
//
// lfm.user_getFriends({
// 	user: 'Christo27',
// 	recenttracks: true,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.user_getInfo({
// 	//user: 'Christo27', //defaults to authenticated user
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
//
// lfm.user_getLovedTracks({
// 	user: 'Christo27',
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.user_getPersonalTags({
// 	user: 'Christo27',
// 	tag: 'folk',
// 	taggingtype: 'album',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.user_getRecentTracks({
// 	user: 'Christo27',
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.user_getTopAlbums({
// 	user: 'Christo27',
// 	period: '1month',
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.user_getTopArtists({
// 	user: 'Christo27',
// 	period: '1month',
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.user_getTopTags({
// 	user: 'Christo27',
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.user_getTopTracks({
// 	user: 'Christo27',
// 	period: '1month',
// 	limit: 5,
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.user_getWeeklyAlbumChart({
// 	user: 'Christo27',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.user_getWeeklyArtistChart({
// 	user: 'Christo27',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.user_getWeeklyChartList({
// 	user: 'Christo27',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });
// 
// lfm.user_getWeeklyTrackChart({
// 	user: 'Christo27',
// 	callback: function(res) {
// 		console.log(res);
// 	}
// });