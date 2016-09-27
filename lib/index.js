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
	//only allow access to method from inside itself
	self._getInfo = function(opt) {
		if (!self.isMethodCaller) throw new Error('Security exception.');
		try {
			if (opt.artist === undefined || opt.artist === '' && typeof opt.callback === 'function') {
				opt.callback({
					'@': {
						status: 'error'
					},
					error: {
						'#': 'Artist not specified.'
					}
				});
			} else {
				var options = {
					method: 'GET',
					uri: 'http://ws.audioscrobbler.com/2.0/',
					qs: {
						method: (opt.track !== undefined && opt.track !== '' ? 'track' : 'artist') + '.getInfo',
						artist: opt.artist,
						api_key: opt.api_key,
						format: 'json',
						autocorrect: 1
					},
					json: true
				};
				if (!(opt.track === undefined || opt.track === '')) {
					options.qs.track = opt.track;
				}
				if (!(opt.username === undefined || opt.track === '')) {
					options.qs.username = opt.username;
				}
				rp(options).then(function(repos) {
					opt.callback(repos);
				}).catch(function(err) {
					if (this.debug) console.log(err);
				});
			}
		} catch (e) {
			if (this.debug) console.log("Exception getting track info: ", e);
		}
	};
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
	// opt = {
	// 	artist: artist, //req
	// 	album: album, //req
	// 	tags: tags, //req, max: 10, comma separated list
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	album: album, //req unless mbid
	// 	mbid: mbid, //opt
	// 	lang: lang, //opt
	// 	username: username //opt
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	album: album, //req unless mbid
	// 	username: username, //req
	// 	mbid: mbid //opt
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	album: album, //req unless mbid
	// 	mbid: mbid //opt
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req
	// 	album: album, //req
	// 	tag: tag, //req, single tag to remove
	// 	callback: callback
	// }
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
	// opt = {
	// 	album: album, //req
	// 	limit: limit, //opt, defaults to 30
	// 	page: page //opt, defaults to 1
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist //req
	// 	tags: tags, //req, max 10, comma separated
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	mbid: mbid, //opt
	// 	username: username, //opt
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	mbid: mbid, //opt
	// 	limit: limit, //opt
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	user: username, //req
	// 	mbid: mbid, //opt
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	mbid: mbid, //opt
	// 	page: page, //opt, default is 50
	// 	limit: limit, //opt, default is 1
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	mbid: mbid, //opt
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	mbid: mbid, //opt
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist //req
	// 	tag: tag, //req, 1 tag to be removed
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
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
	// opt = {
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
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
	// opt = {
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
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
	// opt = {
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
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
	// opt = {
	// 	country: country //req
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
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
	// opt = {
	// 	country: country //req, ISO 3166-1 format
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
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
	// opt = {
	// 	user: username //req, ISO 3166-1 format
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
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
	// opt = {
	// 	tag: tag //req
	// 	lang: lang //opt
	// 	callback: callback
	// }
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
	// opt = {
	// 	tag: tag //req
	// 	callback: callback
	// }
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
	// opt = {
	// 	tag: tag //req
	// 	limit: limit //opt, default is 50
	// 	page: page //opt, default is 1
	// 	callback: callback
	// }
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
	// opt = {
	// 	tag: tag //req
	// 	limit: limit //opt, default is 50
	// 	page: page //opt, default is 1
	// 	callback: callback
	// }
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
	// opt = {
	// 	callback: callback
	// }
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
	// opt = {
	// 	tag: tag //req
	// 	limit: limit //opt, defaults to 50
	// 	page: page //opt, defaults to 1
	// 	callback: callback
	// }
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
	// opt = {
	// 	tag: tag //req
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist //req
	// 	track: track //req
	// 	tags: tags //req, max: 10
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req
	// 	track: track //req
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	track: track, //req unless mbid
	// 	mbid: mbid, //opt
	// 	username: username //opt
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	track: track, //req unless mbid
	// 	mbid: mbid, //opt
	// 	limit: limit, //opt
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	track: track, //req unless mbid
	// 	username: username, //req
	// 	mbid: mbid //opt
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	track: track, //req unless mbid
	// 	mbid: mbid //opt
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	track: track, //req unless mbid
	// 	callback: callback
	// }
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
	// opt = {
	// 	artist: artist, //req
	// 	track: track, //req
	// 	tag: tag, //req, single tag to remove
	// 	callback: callback
	// }
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
	//this'll be a fun one
	// opt = {
	// 	artist: artist[i], //req
	// 	track: track[i], //req
	// 	timestamp: timestamp[i] //req
	// 	album: album[i] //opt
	// 	context: context[i] //opt
	// 	streamId: streamId[i] //opt
	// 	chosenByUser: chosenByUser[i] //opt
	// 	trackNumber: trackNumber[i] //opt
	// 	mbid: mbid[i] //opt
	// 	albumArtist: albumArtist[i] //opt
	// 	duration: duration[i] //opt
	// 	callback: callback
	// }
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
	// opt = {
	// 	track: track, //req
	// 	artist: artist, //opt
	// 	limit: limit, //opt, defaults to 30
	// 	page: page //opt, defaults to 1
	// 	callback: callback
	// }
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
	// opt = {
	// 	track: track, //req
	// 	artist: artist, //req
	// 	callback: callback
	// }
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
	//this'll be a fun one
	// opt = {
	// 	artist: artist, //req
	// 	track: track, //req
	// 	album: album //opt
	// 	context: context //opt
	// 	trackNumber: trackNumber //opt
	// 	mbid: mbid //opt
	// 	albumArtist: albumArtist //opt
	// 	duration: duration //opt
	// 	callback: callback
	// }
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
	//opt = {
	//	user: username //req
	//	artist: artist //req
	//	startTimestamp: startTimestamp //opt defaults to all time
	//	page: page //opt, default is 1
	//	endTimestamp: endTimestamp //opt defaults to all time
	//	callback: callback
	//}
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
	//opt = {
	//	user: username //req
	//	recentTracks: recentTracks //opt
	//	limit: limit //opt defaults to 50
	//	page: page //opt, default is 1
	//	callback: callback
	//}
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
	//opt = {
	//	user: username //opt
	//	callback: callback
	//}
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
	//opt = {
	//	user: username //req
	//	limit: limit //opt, default is 50
	//	page: page //opt, default is 1
	//	callback: callback
	//}
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
	//opt = {
	//	user: username //req
	//	tag: tag //req
	//	taggingtype: artist|album|track //req
	//	limit: limit //opt, default is 50
	//	page: page //opt, default is 1
	//	callback: callback
	//}
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
	//opt = {
	//	user: username //req
	//	from: startTime //opt
	//	extended: 0|1 //opt
	//	to: endTime //opt
	//	limit: limit //opt, default is 50
	//	page: page //opt, default is 1
	//	callback: callback
	//}
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
	//opt = {
	//	user: username //req
	//	period: overall|7day|1month|3month|6month|12month //opt, default is overall
	//	limit: limit //opt, default is 50
	//	page: page //opt, default is 1
	//	callback: callback
	//}
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
	//opt = {
	//	user: username //req
	//	period: overall|7day|1month|3month|6month|12month //opt, default is overall
	//	limit: limit //opt, default is 50
	//	page: page //opt, default is 1
	//	callback: callback
	//}
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
	//opt = {
	//	user: username //req
	//	limit: limit //opt, default is 50
	//	callback: callback
	//}
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
	//opt = {
	//	user: username //req
	//	period: overall|7day|1month|3month|6month|12month //opt, default is overall
	//	limit: limit //opt, default is 50
	//	page: page //opt, default is 1
	//	callback: callback
	//}
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
	//opt = {
	//	user: username //req
	//	from: startdate //opt, default is overall
	//	to: enddate //opt, default is 50
	//	callback: callback
	//}
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
	//opt = {
	//	user: username //req
	//	from: startdate //opt, default is overall
	//	to: enddate //opt, default is 50
	//	callback: callback
	//}
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
	//opt = {
	//	user: username //req
	//	callback: callback
	//}
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
	//opt = {
	//	user: username //req
	//	from: startdate //opt, default is overall
	//	to: enddate //opt, default is 50
	//	callback: callback
	//}
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