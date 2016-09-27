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

	self._getData = function(qs, callback, fullRes = false) {
		var self = this;
		merge(qs, {
			api_key: this.apiKey,
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
				if (res.error === undefined) {
					merge(res, {
						success: true
					});
					callback(res);
				} else {
					merge(res, {
						success: false
					});
					callback(res);
				}
			}).catch(
			function(err) {
				callback({
					success: false
				});
				if (self.debug)
					console.log("Exception: ", err);
			}
		);
	};
	self._postData = function(qs, callback, fullRes = false) {
		var self = this;
		merge(qs, {
			api_key: self.apiKey,
			sk: self.sessionKey,
			format: 'json'
		});
		qs.api_sig = createSignature(qs, this.apiSecret);
		var opt = {
			uri: 'https://ws.audioscrobbler.com/2.0/',
			qs: qs,
			json: true,
			resolveWithFullResponse: fullRes
		};
		rp.post(opt).then(
			function(res) {
				merge(res, {
					success: true
				});
				callback(res);
			}).catch(
			function(err) {
				if (self.debug)
					console.log("Exception: ", err);
				callback({
					success: false,
					err: err
				});
			}
		);
	};
};
//for backwards compat
LastFM.prototype.init = function(options) {
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
		username: this.username,
		password: this.password
	};
	this._postData(qs,
		function(res) {
			if (res.success) {
				self.sessionKey = res.session.key;
				callback({
					success: res.success,
					key: res.session.key
				});
			} else {
				callback(res);
			}
		});
};
//album methods
LastFM.prototype.album_addTags = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.album === '' || qs.album === undefined ||
		qs.tags === '' || qs.tags === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'album.addTags',
	});
	this._postData(qs, opt.callback);
};
LastFM.prototype.album_getInfo = function(opt) {
	var qs = opt || {};
	if (qs.username === '' || qs.username === undefined ||
		((qs.artist === '' || qs.artist === undefined ||
				qs.album === '' || qs.album === undefined) &&
			(qs.mbid === '' || qs.mbid === undefined))) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'album.getInfo',
		autocorrect: 1,
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.album);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.album_getTags = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined ||
			qs.album === '' || qs.album === undefined) &&
		(qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'album.getTags',
		autocorrect: 1,
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.album_getTopTags = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined ||
			qs.album === '' || qs.album === undefined) &&
		(qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'album.getTopTags',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.toptags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.album_removeTag = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.album === '' || qs.album === undefined ||
		qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'album.removeTag',

	});
	this._postData(qs, opt.callback);
};

LastFM.prototype.album_search = function(opt) {
	var qs = opt || {};
	if (qs.album === '' || qs.album === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}

	merge(qs, {
		method: 'album.search',
		autocorrect: 1,
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.results);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_addTags = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined || qs.tags === '' || qs.tags === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.addTags'
	});
	this._postData(qs, opt.callback, true);
};

LastFM.prototype.artist_getCorrection = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing artist'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.getCorrection',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.corrections);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_getInfo = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing artist and mbid'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.getInfo',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.artist);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_getSimilar = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing artist and mbid'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.getSimilar',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.similarartists);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_getTags = function(opt) {
	var qs = opt || {};
	if (((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) ||
		(qs.user === '' || qs.user === undefined)) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required parameters'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.getTags',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_getTopAlbums = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required parameters'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.getTopAlbums',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.topalbums);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_getTopTags = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required parameters'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.getTopTags',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.toptags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_getTopTracks = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required parameters'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.getTopTracks',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.toptracks);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_removeTag = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined || qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.removeTag'
	});
	this._postData(qs, opt.callback, true);
};

LastFM.prototype.artist_search = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing artist'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.search',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.results);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.chart_getTopArtists = function(opt) {
	var qs = opt || {};
	merge(qs, {
		method: 'chart.getTopArtists',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.artists);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.chart_getTopTags = function(opt) {
	var qs = opt || {};
	merge(qs, {
		method: 'chart.getTopTags',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.chart_getTopTracks = function(opt) {
	var qs = opt || {};
	merge(qs, {
		method: 'chart.getTopTracks',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tracks);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.geo_getTopArtists = function(opt) {
	var qs = opt || {};
	if (qs.country === '' || qs.country === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing country'
			}
		});
		return;
	}
	merge(qs, {
		method: 'geo.getTopArtists',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.topartists);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.geo_getTopTracks = function(opt) {
	var qs = opt || {};
	if (qs.country === '' || qs.country === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing country'
			}
		});
		return;
	}
	merge(qs, {
		method: 'geo.getTopTracks',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tracks);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.library_getArtists = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing user'
			}
		});
		return;
	}
	merge(qs, {
		method: 'library.getArtists',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.artists);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.tag_getInfo = function(opt) {
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing tag'
			}
		});
		return;
	}
	merge(qs, {
		method: 'tag.getInfo',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tag);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.tag_getSimilar = function(opt) {
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing tag'
			}
		});
		return;
	}
	merge(qs, {
		method: 'tag.getSimilar',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.similartags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.tag_getTopAlbums = function(opt) {
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing tag'
			}
		});
		return;
	}
	merge(qs, {
		method: 'tag.getTopAlbums',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.albums);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.tag_getTopArtists = function(opt) {
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing tag'
			}
		});
		return;
	}
	merge(qs, {
		method: 'tag.getTopArtists',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.topartists);
		} else {
			opt.callback(res);
		}
	});
};


LastFM.prototype.tag_getTopTags = function(opt) {
	var qs = opt || {};
	merge(qs, {
		method: 'tag.getTopTags',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.toptags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.tag_getTopTracks = function(opt) {
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing tag'
			}
		});
		return;
	}
	merge(qs, {
		method: 'tag.getTopTracks',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tracks);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.tag_getWeeklyChartList = function(opt) {
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing tag'
			}
		});
		return;
	}
	merge(qs, {
		method: 'tag.getWeeklyChartList',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.weeklychartlist);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.track_addTags = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.track === '' || qs.track === undefined ||
		qs.tags === '' || qs.tags === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'track.addTags'
	});
	this._postData(qs, opt.callback);
};

LastFM.prototype.track_getCorrection = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined || qs.track === '' || qs.track === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'track.getCorrection',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.corrections);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.track_getInfo = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined || qs.track === '' || qs.track === undefined) &&
		(qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'track.getInfo',
		autocorrect: 1,
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.track);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.track_getSimilar = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined ||
			qs.track === '' || qs.track === undefined) &&
		(qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing artist and mbid'
			}
		});
		return;
	}
	merge(qs, {
		method: 'track.getSimilar',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.similartracks);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.track_getTags = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined ||
		((qs.artist === '' || qs.artist === undefined ||
				qs.track === '' || qs.track === undefined) &&
			(qs.mbid === '' || qs.mbid === undefined))) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'track.getTags',
		autocorrect: 1,
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.track_getTopTags = function(opt) {
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined ||
			qs.track === '' || qs.track === undefined) &&
		(qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'track.getTopTags',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.toptags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.track_love = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.track === '' || qs.track === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'track.love'
	});
	this._postData(qs, opt.callback);
};

LastFM.prototype.track_removeTag = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.track === '' || qs.track === undefined ||
		qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'track.removeTag'
	});
	this._postData(qs, opt.callback);
};

LastFM.prototype.track_scrobble = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.track === '' || qs.track === undefined ||
		qs.timestamp === '' || qs.timestamp === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'track.scrobble'
	});
	this._postData(qs, opt.callback);
};

LastFM.prototype.track_search = function(opt) {
	var qs = opt || {};
	if (qs.track === '' || qs.track === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'track.search',
		autocorrect: 1,
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.results);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.track_unlove = function(opt) {
	var qs = opt || {};
	if (qs.track === '' || qs.track === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'track.unlove',
	});
	this._postData(qs, opt.callback);
};

LastFM.prototype.track_updateNowPlaying = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.track === '' || qs.track === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'track.updateNowPlaying'
	});
	this._postData(qs, opt.callback);
};

LastFM.prototype.user_getArtistTracks = function(opt) {
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.user === '' || qs.user === undefined) {
		opt.callback({
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
			opt.callback(res.artisttracks);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.user_getFriends = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		opt.callback({
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
			opt.callback(res.friends);
		} else {
			opt.callback(res);
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
			opt.callback(res.user);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.user_getLovedTracks = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		opt.callback({
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
			opt.callback(res.lovedtracks);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.user_getPersonalTags = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined || qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			success: false,
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	if (!(qs.taggingtype === 'artist' || qs.taggingtype === 'album' || qs.taggingtype === 'track')) {
		opt.callback({
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
			opt.callback(res.taggings);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.user_getRecentTracks = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		opt.callback({
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
			opt.callback(res.recenttracks);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.user_getTopAlbums = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		opt.callback({
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
			opt.callback(res.topalbums);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.user_getTopArtists = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		opt.callback({
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
			opt.callback(res.topartists);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.user_getTopTags = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		opt.callback({
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
			opt.callback(res.toptags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.user_getTopTracks = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		opt.callback({
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
			opt.callback(res.toptracks);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.user_getWeeklyAlbumChart = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		opt.callback({
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
			opt.callback(res.weeklyalbumchart);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.user_getWeeklyArtistChart = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		opt.callback({
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
			opt.callback(res.weeklyartistchart);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.user_getWeeklyChartList = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		opt.callback({
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
			opt.callback(res.weeklychartlist);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.user_getWeeklyTrackChart = function(opt) {
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		opt.callback({
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
			opt.callback(res.weeklytrackchart);
		} else {
			opt.callback(res);
		}
	});
};

function createSignature(params, secret) {
	var sig = "";
	Object.keys(params).sort().forEach(function(key) {
		if (key != "format" && key != "callback") {
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
}
module.exports = LastFM;