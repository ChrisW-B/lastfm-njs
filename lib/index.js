var request = require('request'),
	rp = require('request-promise-native'),
	crypto = require('crypto'),
	merge = require('lodash.merge');
var LastFM = function(opts) {
	opts = opts || {};
	var apiKey,
		apiSecret,
		userName,
		password,
		sessionKey,
		self = this,
		isMethodCaller = false;
	this.debug = opts.debug || false;
	if (opts.apiSecret !== undefined && opts.apiSecret !== '')
		this.apiSecret = opts.apiSecret;
	if (opts.apiKey !== undefined && opts.apiKey !== '')
		this.apiKey = opts.apiKey;
	if (opts.username !== undefined && opts.username !== '')
		this.username = opts.username;
	if (opts.password !== undefined && opts.password !== '')
		this.password = opts.password;
	if (opts.sessionKey !== undefined && opts.sessionKey !== '')
		this.sessionKey = opts.sessionKey;

	self._getData = function(qs, fullRes = false) {
		var self = this;
		return new Promise(function(resolve, reject) {
			merge(qs, {
				api_key: self.apiKey,
				format: 'json'
			});
			var opt = {
				method: 'GET',
				uri: 'http://ws.audioscrobbler.com/2.0/',
				json: true,
				qs: qs,
				resolveWithFullResponse: fullRes
			};
			rp(opt).then(
				function(res) {
					if (res.error) {
						reject(res);
					} else {
						resolve(res);
					}
				}).catch(
				function(err) {
					reject({
						success: false,
						error: err
					});
					if (self.debug)
						console.log("Exception: ", err);
				}
			);
		});
	};
	self._postData = function(qs, fullRes = false) {
		var self = this;
		return new Promise(function(resolve, reject) {
			merge(qs, {
				api_key: self.apiKey,
				sk: self.sessionKey,
				format: 'json'
			});
			qs.api_sig = self._createSignature(qs, self.apiSecret);
			var opt = {
				uri: 'https://ws.audioscrobbler.com/2.0/',
				qs: qs,
				json: true,
				resolveWithFullResponse: fullRes
			};
			rp.post(opt).then(
				function(res) {
					resolve(res);
				}).catch(
				function(err) {
					if (self.debug)
						console.log("Exception: ", err);
					reject({
						success: false,
						err: err
					});
				}
			);
		});
	};
	self._get = function(qs, name, callback) {
		if (callback) {
			self._getData(qs).then(function(res) {
				res[name].success = true;
				callback(res[name]);
			}).catch(function(err) {
				callback(err);
			});
		} else {
			return new Promise(function(resolve, reject) {
				self._getData(qs).then(function(res) {
					resolve(res[name]);
				}).catch(function(err) {
					reject(err);
				});
			});
		}
	};
	self._post = function(qs, callback) {
		if (callback) {
			self._postData(qs).then(function(res) {
				res.success = true;
				callback(res);
			}).catch(function(err) {
				res.success = false;
				callback(err);
			});
		} else {
			return self._postData(qs);
		}
	};
	self._sendErr = function(msg, callback) {
		// handles error checking within library,
		// whether using callbacks or promises
		var errMsg = {
			error: 6,
			message: msg
		};
		if (callback) {
			errMsg.success = false;
			callback(errMsg);
		} else {
			return new Promise(function(_, reject) {
				reject(errMsg);
			});
		}
	};

	self._createSignature = function(params, secret) {
		//create signature by hashing
		var sig = "";
		Object.keys(params).sort().forEach(function(key) {
			if (key != "format" && key != "callback") {
				//ignore format and callback keys
				//bc last.fm doesnt use format
				if (params[key].constructor === Array) {
					for (var i = 0; i < params[key].length; i++) {
						sig += key + "[" + i + "]" + params[key][i];
					}
				} else {
					var value = typeof params[key] !== "undefined" && params[key] !== null ? params[key] : "";
					sig += key + value;
				}
			}
		});
		sig += secret;
		return crypto.createHash("md5").update(sig, "utf8").digest("hex");
	};
};
//for backwards compat
LastFM.prototype.init = function(opts) {
	this.apiKey = opts.apiKey;
	this.debug = opts.debug || false;
	if (opts.apiSecret !== undefined && opts.apiSecret !== '')
		this.apiSecret = opts.apiSecret;
	if (opts.username !== undefined && opts.username !== '')
		this.username = opts.username;
	if (opts.password !== undefined && opts.password !== '')
		this.password = opts.password;
	if (opts.sessionKey !== undefined && opts.sessionKey !== '')
		this.sessionKey = opts.sessionKey;
};
LastFM.prototype.auth_getMobileSession = function(callback) {
	var self = this;
	var qs = {
		method: 'auth.getMobileSession',
		username: self.username,
		password: self.password
	};
	if (callback) {
		self._postData(qs).then(function(res) {
			self.sessionKey = res.session.key;
			callback({
				success: true,
				key: res.session.key
			});
		}).catch(function(err) {
			callback(err);
		});
	} else {
		return new Promise(function(resolve, reject) {
			self._postData(qs).then(function(res) {
				self.sessionKey = res.session.key;
				resolve({
					success: true,
					key: res.session.key
				});
			}).catch(function(err) {
				reject(err);
			});
		});
	}
};

//album methods
LastFM.prototype.album_addTags = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.album === '' || qs.album === undefined ||
		qs.tags === '' || qs.tags === undefined) {
		return this._sendErr('Missing required params', qs.callback);
	}
	qs.method = 'album.addTags';
	return this._post(qs, qs.callback);
};

LastFM.prototype.album_getInfo = function(opt) {
	var qs = opt || {};
	if (qs.username === '' || qs.username === undefined ||
		((qs.artist === '' || qs.artist === undefined ||
				qs.album === '' || qs.album === undefined) &&
			(qs.mbid === '' || qs.mbid === undefined))) {
		return this._sendErr('Missing required params', qs.callback);
	}
	merge(qs, {
		method: 'album.getInfo',
		autocorrect: 1,
	});
	return this._get(qs, 'album', qs.callback);
};

LastFM.prototype.album_getTags = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined ||
			qs.album === '' || qs.album === undefined) &&
		(qs.mbid === '' || qs.mbid === undefined)) {
		return this._sendErr('Missing required params', qs.callback);
	}
	merge(qs, {
		method: 'album.getTags',
		autocorrect: 1,
	});
	return this._get(qs, 'tags', qs.callback);
};

LastFM.prototype.album_getTopTags = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined ||
			qs.album === '' || qs.album === undefined) &&
		(qs.mbid === '' || qs.mbid === undefined)) {
		return this._sendErr('Missing required params', qs.callback);
	}
	merge(qs, {
		method: 'album.getTopTags',
		autocorrect: 1
	});
	return this._get(qs, 'toptags', qs.callback);
};

LastFM.prototype.album_removeTag = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.album === '' || qs.album === undefined ||
		qs.tag === '' || qs.tag === undefined) {
		return this._sendErr('Missing required params', qs.callback);
	}
	qs.method = 'album.removeTag';
	return this._post(qs, qs.callback)
};

LastFM.prototype.album_search = function(opt) {
	var qs = opt || {};
	if (qs.album === '' || qs.album === undefined) {
		return this._sendErr('Missing album param', qs.callback);
	}
	merge(qs, {
		method: 'album.search',
		autocorrect: 1,
	});
	return this._get(qs, 'results', qs.callback)
};

//Artist methods
LastFM.prototype.artist_addTags = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined || qs.tags === '' || qs.tags === undefined) {
		return this._sendErr('Missing required parameters', qs.callback)
	}
	qs.method = 'artist.addTags'
	return this._post(qs, qs.callback);
};

LastFM.prototype.artist_getCorrection = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined) {
		return this._sendErr('Missing Artist', qs.callback);
	}
	qs.method = 'artist.getCorrection'
	return this._get(qs, 'corrections', qs.callback);
};

LastFM.prototype.artist_getInfo = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		return this._sendErr('Missing both artist and mbid', qs.callback);
	}
	merge(qs, {
		method: 'artist.getInfo',
		autocorrect: 1
	});
	return this._get(qs, 'artist', qs.callback);
};

LastFM.prototype.artist_getSimilar = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		return this._sendErr('Missing both artist and mbid', qs.callback);
	}
	merge(qs, {
		method: 'artist.getSimilar',
		autocorrect: 1
	});
	return this._get(qs, 'similarartists', qs.callback)
};

LastFM.prototype.artist_getTags = function(opt) {
	var qs = opt || {};
	if (((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) ||
		(qs.user === '' || qs.user === undefined)) {
		return this._sendErr('Missing both artist and mbid', qs.callback);
	}
	merge(qs, {
		method: 'artist.getTags',
		autocorrect: 1
	});
	return this._get(qs, 'tags', qs.callback);
};

LastFM.prototype.artist_getTopAlbums = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		return this._sendErr('Missing both artist and mbid', qs.callback);
	}
	merge(qs, {
		method: 'artist.getTopAlbums',
		autocorrect: 1
	});
	return this._get(qs, 'topalbums', qs.callback);
};

LastFM.prototype.artist_getTopTags = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		return this._sendErr('Missing both artist and mbid', qs.callback);
	}
	merge(qs, {
		method: 'artist.getTopTags',
		autocorrect: 1
	});
	return this._get(qs, 'toptags', qs.callback);
};

LastFM.prototype.artist_getTopTracks = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		return this._sendErr('Missing both artist and mbid', qs.callback);
	}
	merge(qs, {
		method: 'artist.getTopTracks',
		autocorrect: 1
	});
	return this._get(qs, 'toptracks', qs.callback);
};

LastFM.prototype.artist_removeTag = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined || qs.tag === '' || qs.tag === undefined) {
		return this._sendErr('Missing required parameters', qs.callback);
	}
	qs.method = 'artist.removeTag';
	return this._post(qs, qs.callback)
};

LastFM.prototype.artist_search = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined) {
		return this._sendErr('Missing artist to search', qs.callback);
	}
	merge(qs, {
		method: 'artist.search',
		autocorrect: 1
	});
	return this._get(qs, 'results', qs.callback)
};

//Chart Methods
LastFM.prototype.chart_getTopArtists = function(opt) {
	var qs = opt || {};
	merge(qs, {
		method: 'chart.getTopArtists',
		autocorrect: 1
	});
	return this._get(qs, 'artists', qs.callback);
};

LastFM.prototype.chart_getTopTags = function(opt) {
	var qs = opt || {};
	merge(qs, {
		method: 'chart.getTopTags',
		autocorrect: 1
	});
	return this._get(qs, 'tags', qs.callback);
};

LastFM.prototype.chart_getTopTracks = function(opt) {
	var qs = opt || {};
	merge(qs, {
		method: 'chart.getTopTracks',
		autocorrect: 1
	});
	return this._get(qs, 'tracks', qs.callback);
};

//Geo Methods
LastFM.prototype.geo_getTopArtists = function(opt) {
	var qs = opt || {};
	if (qs.country === '' || qs.country === undefined) {
		return this._sendErr('Missing country', qs.callback);
	}
	merge(qs, {
		method: 'geo.getTopArtists',
		autocorrect: 1
	});
	return this._get(qs, 'topartists', qs.callback)
};

LastFM.prototype.geo_getTopTracks = function(opt) {
	var qs = opt || {};
	if (qs.country === '' || qs.country === undefined) {
		return this._sendErr('Missing country', qs.callback);
	}
	merge(qs, {
		method: 'geo.getTopTracks',
		autocorrect: 1
	});
	return this._get(qs, 'tracks', qs.callback)
};

//Library Methods
LastFM.prototype.library_getArtists = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		return this._sendErr('Missing username', qs.callback)
	}
	merge(qs, {
		method: 'library.getArtists',
		autocorrect: 1
	});
	return this._get(qs, 'artists', qs.callback)
};

//Tag Methods
LastFM.prototype.tag_getInfo = function(opt) {
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		return this._sendErr('No tag given', qs.callback);
	}
	qs.method = 'tag.getInfo';
	return this._get(qs, 'tag', qs.callback);
};

LastFM.prototype.tag_getSimilar = function(opt) {
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		return this._sendErr('No tag given', qs.callback);
	}
	qs.method = 'tag.getSimilar';
	return this._get(qs, 'similartags', qs.callback);
};

LastFM.prototype.tag_getTopAlbums = function(opt) {
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		return this._sendErr('No tag given', qs.callback);
	}
	qs.method = 'tag.getTopAlbums';
	return this._get(qs, 'albums', qs.callback);
};

LastFM.prototype.tag_getTopArtists = function(opt) {
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		return this._sendErr('No tag given', qs.callback);
	}
	qs.method = 'tag.getTopArtists';
	return this._get(qs, 'topartists', qs.callback);
};

LastFM.prototype.tag_getTopTags = function(opt) {
	var qs = opt || {};
	qs.method = 'tag.getTopTags';
	return this._get(qs, 'toptags', qs.callback);
};

LastFM.prototype.tag_getTopTracks = function(opt) {
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		return this._sendErr('No tag given', qs.callback);
	}
	qs.method = 'tag.getTopTracks';
	return this._get(qs, 'tracks', qs.callback);
};

LastFM.prototype.tag_getWeeklyChartList = function(opt) {
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		return this._sendErr('No tag given', qs.callback);
	}
	qs.method = 'tag.getWeeklyChartList';
	return this._get(qs, 'weeklychartlist', qs.callback);
};

//Track methods
LastFM.prototype.track_addTags = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.track === '' || qs.track === undefined ||
		qs.tags === '' || qs.tags === undefined) {
		return this._sendErr("Missing required params", qs.callback);
	}
	qs.method = 'track.addTags';
	return this._post(qs, qs.callback);
};

LastFM.prototype.track_getCorrection = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined || qs.track === '' || qs.track === undefined) {
		return this._sendErr("Missing required params", qs.callback);
	}
	qs.method = 'track.getCorrection';
	return this._get(qs, 'corrections', qs.callback);
};

LastFM.prototype.track_getInfo = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined || qs.track === '' || qs.track === undefined) &&
		(qs.mbid === '' || qs.mbid === undefined)) {
		return this._sendErr("Missing required params", qs.callback);
	}
	merge(qs, {
		method: 'track.getInfo',
		autocorrect: 1,
	});
	return this._get(qs, 'track', qs.callback);
};

LastFM.prototype.track_getSimilar = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined ||
			qs.track === '' || qs.track === undefined) &&
		(qs.mbid === '' || qs.mbid === undefined)) {
		return this._sendErr('Missing both artist and mbid', qs.callback);
	}
	merge(qs, {
		method: 'track.getSimilar',
		autocorrect: 1
	});
	return this._get(qs, 'similartracks', qs.callback);
};

LastFM.prototype.track_getTags = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined ||
		((qs.artist === '' || qs.artist === undefined ||
				qs.track === '' || qs.track === undefined) &&
			(qs.mbid === '' || qs.mbid === undefined))) {
		return this._sendErr('Missing required params', qs.callback);
	}
	merge(qs, {
		method: 'track.getTags',
		autocorrect: 1,
	});
	return this._get(qs, 'tags', qs.callback);
};

LastFM.prototype.track_getTopTags = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined ||
			qs.track === '' || qs.track === undefined) &&
		(qs.mbid === '' || qs.mbid === undefined)) {
		return this._sendErr('Missing required params', qs.callback);
	}
	merge(qs, {
		method: 'track.getTopTags',
		autocorrect: 1
	});
	return this._get(qs, 'toptags', qs.callback);
};

LastFM.prototype.track_love = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.track === '' || qs.track === undefined) {
		return this._sendErr('Missing required params', qs.callback);
	}
	merge(qs, {
		method: 'track.love'
	});
	return this._postData(qs, qs.callback);
};

LastFM.prototype.track_removeTag = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.track === '' || qs.track === undefined ||
		qs.tag === '' || qs.tag === undefined) {
		return this._sendErr('Missing required params', qs.callback);
	}
	qs.method = 'track.removeTag';
	return this._post(qs, qs.callback);
};

LastFM.prototype.track_scrobble = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.track === '' || qs.track === undefined ||
		qs.timestamp === '' || qs.timestamp === undefined) {
		return this._sendErr('Missing required params', qs.callback);
	}
	qs.method = 'track.scrobble';
	return this._post(qs, qs.callback);
};

LastFM.prototype.track_search = function(opt) {
	var qs = opt || {};
	if (qs.track === '' || qs.track === undefined) {
		return this._sendErr('Missing track for search', qs.callback);
	}
	merge(qs, {
		method: 'track.search',
		autocorrect: 1,
	});
	return this._get(qs, 'results', qs.callback);
};

LastFM.prototype.track_unlove = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.track === '' || qs.track === undefined) {
		return this._sendErr('Missing track and artist', qs.callback);
	}
	qs.method = 'track.unlove';
	return this._post(qs, qs.callback);
};

LastFM.prototype.track_updateNowPlaying = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.track === '' || qs.track === undefined) {
		return this._sendErr('Missing track and artist', qs.callback);
	}
	qs.method = 'track.updateNowPlaying';
	return this._post(qs, qs.callback);
};

//User Methods
LastFM.prototype.user_getArtistTracks = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.user === '' || qs.user === undefined) {
		qs.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'user.getArtistTracks'
	});
	this._getData(qs, function(res) {
		if (res.success) {
			res.artisttracks.success = true;
			qs.callback(res.artisttracks);
		} else {
			qs.callback(res);
		}
	});
};

LastFM.prototype.user_getFriends = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		qs.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'user.getFriends'
	});
	this._getData(qs, function(res) {
		if (res.success) {
			res.friends.success = true;
			qs.callback(res.friends);
		} else {
			qs.callback(res);
		}
	});
};

LastFM.prototype.user_getInfo = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		qs.user = this.username;
	}
	merge(qs, {
		method: 'user.getInfo'
	});
	this._getData(qs, function(res) {
		if (res.success) {
			res.user.success = true;
			qs.callback(res.user);
		} else {
			qs.callback(res);
		}
	});
};

LastFM.prototype.user_getLovedTracks = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		qs.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'user.getLovedTracks'
	});
	this._getData(qs, function(res) {
		if (res.success) {
			res.lovedtracks.success = true;
			qs.callback(res.lovedtracks);
		} else {
			qs.callback(res);
		}
	});
};

LastFM.prototype.user_getPersonalTags = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined || qs.tag === '' || qs.tag === undefined) {
		qs.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	if (!(qs.taggingtype === 'artist' || qs.taggingtype === 'album' || qs.taggingtype === 'track')) {
		qs.callback({
			success: false,
			error: {
				'#': 'Invalid tagging type'
			}
		});
		return;
	}
	merge(qs, {
		method: 'user.getPersonalTags'
	});
	this._getData(qs, function(res) {
		if (res.success) {
			res.taggings.success = true;
			qs.callback(res.taggings);
		} else {
			qs.callback(res);
		}
	});
};

LastFM.prototype.user_getRecentTracks = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		qs.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'user.getRecentTracks'
	});
	this._getData(qs, function(res) {
		if (res.success) {
			res.recenttracks.success = true;
			qs.callback(res.recenttracks);
		} else {
			qs.callback(res);
		}
	});
};

LastFM.prototype.user_getTopAlbums = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		qs.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'user.getTopAlbums'
	});
	this._getData(qs, function(res) {
		if (res.success) {
			res.topalbums.success = true;
			qs.callback(res.topalbums);
		} else {
			qs.callback(res);
		}
	});
};

LastFM.prototype.user_getTopArtists = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		qs.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'user.getTopArtists'
	});
	this._getData(qs, function(res) {
		if (res.success) {
			res.topartists.success = true;
			qs.callback(res.topartists);
		} else {
			qs.callback(res);
		}
	});
};

LastFM.prototype.user_getTopTags = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		qs.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'user.getTopTags'
	});
	this._getData(qs, function(res) {
		if (res.success) {
			res.toptags.success = true;
			qs.callback(res.toptags);
		} else {
			qs.callback(res);
		}
	});
};

LastFM.prototype.user_getTopTracks = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		qs.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'user.getTopTracks'
	});
	this._getData(qs, function(res) {
		if (res.success) {
			res.toptracks.success = true;
			qs.callback(res.toptracks);
		} else {
			qs.callback(res);
		}
	});
};

LastFM.prototype.user_getWeeklyAlbumChart = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		qs.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'user.getWeeklyAlbumChart'
	});
	this._getData(qs, function(res) {
		if (res.success) {
			res.weeklyalbumchart.success = true;
			qs.callback(res.weeklyalbumchart);
		} else {
			qs.callback(res);
		}
	});
};

LastFM.prototype.user_getWeeklyArtistChart = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		qs.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'user.getWeeklyArtistChart'
	});
	this._getData(qs, function(res) {
		if (res.success) {
			res.weeklyartistchart.success = true;
			qs.callback(res.weeklyartistchart);
		} else {
			qs.callback(res);
		}
	});
};

LastFM.prototype.user_getWeeklyChartList = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		qs.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'user.getWeeklyChartList'
	});
	this._getData(qs, function(res) {
		if (res.success) {
			res.weeklychartlist.success = true;
			qs.callback(res.weeklychartlist);
		} else {
			qs.callback(res);
		}
	});
};

LastFM.prototype.user_getWeeklyTrackChart = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		qs.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'user.getWeeklyTrackChart'
	});
	this._getData(qs, function(res) {
		if (res.success) {
			res.weeklytrackchart.success = true;
			qs.callback(res.weeklytrackchart);
		} else {
			qs.callback(res);
		}
	});
};

module.exports = LastFM;